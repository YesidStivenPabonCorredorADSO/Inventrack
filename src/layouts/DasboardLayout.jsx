import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import { supabase } from "../supaBase/supaBase";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    const validarAcceso = async () => {
      if (hasChecked.current) return;
      hasChecked.current = true;

      try {
        // 1. Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/login", { replace: true });
          return;
        }

        // 2. Cargar datos del usuario
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          await supabase.auth.signOut();
          navigate("/login", { replace: true });
          return;
        }

        // 3. Guardar usuario
        setUsuario(data);

      } catch (error) {
        navigate("/login", { replace: true });
      } finally {
        setCargando(false);
      }
    };

    validarAcceso();
  }, [navigate]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Validando información...</p>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar usuario={usuario} />
      <main className="flex-1 p-6">
        <Outlet context={{usuario}}/>
      </main>
    </div>
  );
}
