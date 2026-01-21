import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../componentes/Button';
import InputField from '../../componentes/Input';
import SelectField from '../../componentes/SelectField';
import { supabase } from '../../supaBase/supaBase';
import * as yup from 'yup';

export default function CreateEmpresa() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiposNegocio, setTiposNegocio] = useState([]);
  const [formData, setFormData] = useState({
    nameEmpresa: '',
    nit: '',
    tipoNegocio: '',
    direccion: '',
    correo: '',
    telefono: ''
  });

  const validacionForm = yup.object().shape({
    nameEmpresa: yup
      .string()
      .required("El nombre de la empresa es requerido")
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(30, "El nombre no debe exceder 30 caracteres"),
    nit: yup
      .string()
      .required("El NIT es obligatorio")
      .matches(/^[0-9]{9,10}(-[0-9])?$/, "Formato inválido. Ej: 900123456-7"),
    tipoNegocio: yup
      .string()
      .required("Selecciona un tipo de negocio"),
    direccion: yup
      .string()
      .required("La dirección es requerida"),
    correo: yup
      .string()
      .required("El correo es requerido")
      .email("Debe ser válido el correo"),
    telefono: yup
      .string()
      .matches(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
  });

  useEffect(() => {
    const fetchTipos = async () => {
      const { data, error } = await supabase
        .from("tipo_negocio")
        .select("*");

      if (!error) {
        setTiposNegocio(
          data.map(t => ({
            value: t.id_tipo,
            label: t.nombre_tipo
          }))
        );
      }
    };

    fetchTipos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const hanlderBlur = async (e) => {
    const { name, value } = e.target;
    try {
      await yup.reach(validacionForm, name).validate(value);
      setErrors({
        ...errors,
        [name]: ""
      });
    } catch (error) {
      setErrors({
        ...errors,
        [name]: error.message
      });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});

  try {
    await validacionForm.validate(formData, { abortEarly: false });
    console.log("📋 Iniciando creación de empresa...");

    // 1️⃣ Obtener usuario autenticado (ADMIN)
    const { data: authUserData, error: authError } = await supabase.auth.getUser();

    if (authError || !authUserData?.user) {
      alert("❌ No hay un usuario autenticado. No se puede crear la empresa.");
      return;
    }

    const authUser = authUserData.user;
    console.log("👤 Usuario autenticado:", authUser.email, authUser.id);

    // 2️⃣ Verificar empresa existente
    const { data: empresaExistente } = await supabase
      .from("empresa")
      .select("nombre_empresa, correo")
      .eq("correo", formData.correo)
      .maybeSingle();

    if (empresaExistente) {
      alert(`⚠️ Ya existe una empresa con este correo:\n"${empresaExistente.nombre_empresa}"`);
      setErrors({ correo: `Este correo ya está registrado en "${empresaExistente.nombre_empresa}"` });
      return;
    }

    // 3️⃣ Crear empresa (SIN MAGIC LINK)
    const { data: empresaData, error: empresaError } = await supabase
      .from("empresa")
      .insert([
        {
          nombre_empresa: formData.nameEmpresa,
          nit: formData.nit,
          direccion: formData.direccion,
          telefono: formData.telefono,
          correo: formData.correo,
          tipo_negocio: formData.tipoNegocio,
          auth_user_id: authUser.id   // ← IMPORTANTE
        }
      ])
      .select()
      .single();

    if (empresaError) {
      console.error("❌ Error creando empresa:", empresaError);

      if (empresaError.code === "23505") {
        setErrors({ correo: "Este correo ya está registrado" });
        alert("⚠️ Este correo ya está registrado.");
        return;
      }

      alert("Error al crear la empresa: " + empresaError.message);
      return;
    }

    console.log("✅ Empresa creada correctamente:", empresaData);

    // 4️⃣ Mensaje final
    alert(`✅ Empresa "${empresaData.nombre_empresa}" creada correctamente.
El usuario ${formData.correo} deberá iniciar sesión desde la pantalla de Login.`);

    // 5️⃣ Limpiar formulario
    setFormData({
      nameEmpresa: "",
      nit: "",
      tipoNegocio: "",
      direccion: "",
      correo: "",
      telefono: ""
    });

    setTimeout(() => navigate("/dashboard/catalogo-empresa"), 2000);

  } catch (error) {
    console.error("💥 Error:", error);

    if (error.inner) {
      const errObj = {};
      error.inner.forEach((e) => (errObj[e.path] = e.message));
      setErrors(errObj);
    } else {
      alert("Error inesperado: " + error.message);
    }

  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Icono principal */}
          <div className="flex justify-center mb-8">
            <svg 
              className="h-16 w-16 text-blue-900" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" x2="12" y1="22.08" y2="12" />
            </svg>
          </div>

          {/* Título y descripción */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Configura tu Empresa en Inventrack
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Completa los datos para comenzar a gestionar tu inventario y
              producción de forma eficiente.
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Nombre de la Empresa */}
              <div className="relative">
                <InputField 
                  label={"Nombre de la empresa"}
                  name={"nameEmpresa"}
                  placeholder={"Nombre Empresa"}
                  type='text'
                  value={formData.nameEmpresa}
                  onChange={handleInputChange}
                  onBlur={hanlderBlur}
                  error={errors.nameEmpresa}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>

              {/* Nit */}
              <div className='relative'>
                <InputField
                  label={"Nit"}
                  name={"nit"}
                  placeholder={"Nit"}
                  onBlur={hanlderBlur}
                  onChange={handleInputChange}
                  error={errors.nit}
                  icon={
                    <svg
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="8" y1="10" x2="12" y2="10" />
                      <line x1="8" y1="14" x2="14" y2="14" />
                    </svg>
                  }
                />
              </div>

              {/* Tipo de Negocio */}
              <div className="relative">
                <SelectField
                  label="Tipo de Negocio"
                  name="tipoNegocio"
                  value={formData.tipoNegocio}
                  onChange={handleInputChange}
                  onBlur={hanlderBlur}
                  error={errors.tipoNegocio}
                  options={tiposNegocio}
                  icon={
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
              </div>

              {/* Dirección */}
              <div className="relative">
                <InputField
                  label={"Dirección"}
                  type='text'
                  name={"direccion"}
                  placeholder={"Dirección"}
                  value={formData.direccion}
                  onChange={handleInputChange}
                  onBlur={hanlderBlur}
                  error={errors.direccion}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Correo Electrónico */}
              <div className="relative">
                <InputField
                  label={"Correo Electrónico"}
                  type='email'
                  name={"correo"}
                  placeholder={"Correo Electrónico"}
                  value={formData.correo}
                  onChange={handleInputChange}
                  onBlur={hanlderBlur}
                  error={errors.correo}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              {/* Número de Teléfono */}
              <div className="relative">
                <InputField
                  label={"Número de Teléfono"}
                  placeholder={"Número de teléfono"}
                  type='tel'
                  name={"telefono"}
                  value={formData.telefono}
                  onChange={handleInputChange}
                  onBlur={hanlderBlur}
                  error={errors.telefono}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
              </div>

              {/* Botón de envío */}
              <div className="pt-4">
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar y Continuar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}