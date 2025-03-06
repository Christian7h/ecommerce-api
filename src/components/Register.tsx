import { useState } from "react";
import { AUTH_URL } from "../env.ts"; // Importamos la variable correctamente

const Register = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setError(null); // Reiniciar error antes de la petición

    try {
      console.log("AUTH_URL:", AUTH_URL); // Debug URL

      const response = await fetch(`https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setError(data.message || "Error al registrarse");
        } else {
          setError("Error inesperado. El servidor no devolvió un JSON válido.");
        }
        return;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error("Error en la petición:", err);
      setError("Error de conexión. Verifica tu red.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Registrarse</h1>
            <p className="mt-2 text-sm text-gray-600">
              Crea tu cuenta para comenzar a organizar tus tareas
            </p>
          </div>

          {error && <p className="bg-red-50 text-red-500 p-3 rounded text-center text-sm mb-6">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tu@correo.com"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Acepto los{" "}
                <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Términos de servicio
                </a>{" "}
                y la{" "}
                <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Política de privacidad
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Crear cuenta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </a>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">© 2025 TodoApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </main>
  );
};

export default Register;
