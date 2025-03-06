import { useState } from "react";
import Cookies from "js-cookie"; // Importamos js-cookie

const Login = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setError(null);

    try {

      const response = await fetch(`https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setError(data.message || "Error al iniciar sesión");
        } else {
          setError("Error inesperado. El servidor no devolvió un JSON válido.");
        }
        return;
      }

      const data = await response.json();
      
      // Guardamos el token en cookies con js-cookie
      Cookies.set("token", data.token, { expires: 1, path: "/" }); // Expira en 1 día

      // Redirigir a la página principal
      window.location.href = "/";
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
            <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="mt-2 text-sm text-gray-600">Accede a tu cuenta para gestionar tus tareas</p>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>

              <a href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Regístrate
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

export default Login;
