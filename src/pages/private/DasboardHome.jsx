import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supaBase/supaBase";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/login", { replace: true });
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (userError) {
          navigate("/login", { replace: true });
          return;
        }

        setUsuario(userData);
      } catch (error) {
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!usuario) return null;

  const esAdmin = usuario.id_rol_fk === 1;
  const esUsuario = usuario.id_rol_fk === 2;
  const tieneEmpresa = usuario.id_empresa_fk !== null;

  return (
    <div className="space-y-8">
      
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-xl shadow-lg">
        <h2 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {usuario.nombre_completo}! 👋
        </h2>
        <p className="text-lg text-blue-100">
          {esAdmin ? "Panel de Administrador" : "Panel de Usuario"}
        </p>
      </div>


      {/* 🎯 DIFERENCIACIÓN SEGÚN EL ROL */}
      {esAdmin && (
        <>
          {/* --- ADMIN PANEL --- */}
          <h3 className="text-2xl font-bold">Administración</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Acceso al catálogo */}
            <button
              onClick={() => navigate("/dashboard/catalogo-empresa")}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">Catálogo de Empresas</p>
              <p className="text-sm text-gray-500">Ver y gestionar empresas</p>
            </button>

            {/* Gestionar empresa */}
            <button
              onClick={() => navigate("/dashboard/create-empresa")}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">
                {tieneEmpresa ? "Gestionar Empresa" : "Crear Empresa"}
              </p>
              <p className="text-sm text-gray-500">
                {tieneEmpresa ? "Editar información empresarial" : "Registrar empresa"}
              </p>
            </button>

          </div>
        </>
      )}


      {esUsuario && (
        <>
          {/* --- USER PANEL --- */}
          <h3 className="text-2xl font-bold">Opciones del Usuario</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Botón gestión de empresa */}
            <button
              onClick={() => navigate("/dashboard/create-empresa")}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">
                {tieneEmpresa ? "Mi Empresa" : "Registrar Empresa"}
              </p>
              <p className="text-sm text-gray-500">
                {tieneEmpresa ? "Ver / Editar datos" : "Completa tu información empresarial"}
              </p>
            </button>

            {/* Botón gestión de costos */}
            <button
              onClick={() => navigate("/dashboard/gestion-costos")}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold">Gestión de Costos</p>
              <p className="text-sm text-gray-500">
                Administra productos y costos de producción
              </p>
            </button>
          </div>

        </>
      )}
    </div>
  );
}
