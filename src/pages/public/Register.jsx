import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../componentes/Button';
import { registerUser } from '../../services/registerUser';
import InputField from '../../componentes/Input';
import { supabase } from '../../supaBase/supaBase';
import * as yup from 'yup';

export default function Register() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  // Validaciones con Yup
  const validacionForm = yup.object().shape({
    nombreCompleto: yup
      .string()
      .required("El nombre es requerido")
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(50, "El nombre no debe exceder 50 caracteres"),
    correo: yup
      .string()
      .required("El correo es requerido")
      .email("Debe ser un correo válido"),
    password: yup
      .string()
      .required("La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
      .matches(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: yup
      .string()
      .required("Confirma tu contraseña")
      .oneOf([yup.ref('password')], "Las contraseñas no coinciden")
  });

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

  const handleBlur = async (e) => {
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
      // Validar formulario completo
      await validacionForm.validate(formData, { abortEarly: false });

      // Llamar a la función de registro
      const result = await registerUser({
        nombreCompleto: formData.nombreCompleto,
        correo: formData.correo,
        password: formData.password
      });

      if (!result.ok) {
        alert("⚠️ " + result.error);
        return;
      }

      // Éxito
      alert(`✅ Registro exitoso.\nBienvenido ${formData.nombreCompleto}`);

      setFormData({
        nombreCompleto: "",
        correo: "",
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      if (error.inner) {
        const errObj = {};
        error.inner.forEach(e => (errObj[e.path] = e.message));
        setErrors(errObj);
      } else {
        alert("Error inesperado: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Icono principal */}
          <div className="flex justify-center mb-8">
            <svg 
              className="h-16 w-16 text-blue-900 dark:text-blue-400" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          {/* Título y descripción */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Crear Cuenta en Inventrack
            </h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Regístrate para gestionar tu inventario y producción
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className='space-y-6'>
              
              {/* Nombre Completo */}
              <div className="relative">
                <InputField 
                  label="Nombre Completo"
                  name="nombreCompleto"
                  placeholder="Ingresa tu nombre"
                  type='text'
                  value={formData.nombreCompleto}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={errors.nombreCompleto}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              </div>

              {/* Correo Electrónico */}
              <div className="relative">
                <InputField
                  label="Correo Electrónico"
                  type='email'
                  name="correo"
                  placeholder="ingresa tu correo eletronico"
                  value={formData.correo}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
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

              {/* Contraseña */}
              <div className="relative">
                <InputField
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  type='password'
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
              </div>

              {/* Confirmar Contraseña */}
              <div className="relative">
                <InputField
                  label="Confirmar Contraseña"
                  placeholder="Repite tu contraseña"
                  type='password'
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  icon={
                    <svg 
                      className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Botón de envío */}
              <div className="pt-4">
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
                </Button>
              </div>

              {/* Link a login */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Al registrarte, aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}