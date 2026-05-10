import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyUser } from "../../services/verifyUser";
import Button from "../../componentes/Button";
import InputField from "../../componentes/Input";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recibe el correo y nombre desde Register via navigate state
  const { correo, nombreCompleto } = location.state || {};

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!codigo || codigo.length !== 6) {
      setError("Ingresa el código de 6 dígitos");
      return;
    }

    if (!correo) {
      setError("No se encontró el correo. Vuelve a registrarte.");
      return;
    }

    setIsSubmitting(true);

    const result = await verifyUser({ correo, codigo, nombreCompleto });

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verificar correo
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enviamos un código de 6 dígitos a
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {correo || "tu correo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Código de verificación"
            name="codigo"
            type="text"
            placeholder="Código de seis dígitos"
            value={codigo}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCodigo(val);
            }}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verificando..." : "Enviar"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Iniciar sesión con otro correo electrónico
          </button>
        </div>

      </div>
    </div>
  );
}