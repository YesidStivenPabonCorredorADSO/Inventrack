import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supaBase/supaBase";
import * as yup from "yup";
import Button from "../../componentes/Button";
import InputField from "../../componentes/Input";

function LoginPages() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📌 Validación Yup
  const validacion = yup.object().shape({
    email: yup
      .string()
      .required("El email es requerido")
      .email("Debe ser un correo válido"),
    password: yup.string().required("La contraseña es requerida"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    try {
      await yup.reach(validacion, name).validate(value);
      setErrors({ ...errors, [name]: "" });
    } catch (error) {
      setErrors({ ...errors, [name]: error.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar Yup
      await validacion.validate(formData, { abortEarly: false });

      // 1️⃣ Login en Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) {
        setIsSubmitting(false);
        return alert("Correo o contraseña incorrectos.");
      }

      const user = authData.user;

      if (!user) {
        setIsSubmitting(false);
        return alert("No se pudo iniciar sesión.");
      }

      // 2️⃣ Verificar perfil en la tabla usuario
      const { data: perfil, error: errorPerfil } = await supabase
        .from("usuarios")        // 👈 nombre de tu tabla interna
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (errorPerfil || !perfil) {
        await supabase.auth.signOut();
        setIsSubmitting(false);
        return alert("Tu perfil interno no existe. Contacta soporte.");
      }

      // 3️⃣ Validar estado
      if (perfil.id_estado_fk !== 1) {
        await supabase.auth.signOut();
        setIsSubmitting(false);
        return alert("Tu cuenta está inactiva.");
      }

      // 4️⃣ Redirigir al dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Manejo de errores de Yup
      const validationErrors = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white">
              Inventrack
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ingresa con tu correo y contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="Ingresa tu correo"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
            />

            <InputField
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
            />

            <Button
              className="mt-4"
              variant="primary"
              size="medium"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Inventrack. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPages;
