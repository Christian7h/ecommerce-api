// src/components/ConfirmPayment.tsx
import React, { useEffect, useState } from "react";

interface Result {
  status: string;
  orderId: string;
  amount: number;
  message: string;
}

interface ConfirmPaymentProps {
  tokenWs: string | null;
}

const ConfirmPayment: React.FC<ConfirmPaymentProps> = ({ tokenWs }) => {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      if (tokenWs) {
        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

          if (!token) {
            window.location.href = "/login";
            return;
          }

          setLoading(true);
          const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/orders/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token: tokenWs }),
          });
          const data = await response.json();
          setResult(data);
        } catch (error) {
          console.error("Error al confirmar el pago:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [tokenWs]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmación de Pago</h1>
      
      {loading ? (
        <div className="animate-pulse bg-white p-6 rounded-lg shadow-lg">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      ) : result ? (
        <div className={`bg-white p-6 rounded-lg shadow-lg ${
          result.status === "AUTHORIZED" ? 'border-green-500 border-2' : 'border-red-500 border-2'
        }`}>
          {result.status === "AUTHORIZED" ? (
            <>
              <h2 className="text-xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h2>
              <p className="mb-2">Tu orden <span className="font-semibold">#{result.orderId}</span> ha sido procesada correctamente.</p>
              <p className="mb-4">Monto total: <span className="font-semibold">${result.amount}</span></p>
              <p className="text-sm text-gray-600">Recibirás un correo electrónico con los detalles de tu compra.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-red-600 mb-4">Error en el Pago</h2>
              <p className="mb-4">{result.message || "Ha ocurrido un error al procesar tu pago. Por favor, intenta de nuevo."}</p>
            </>
          )}
          
          <div className="mt-6 flex justify-between">
            <a href="/" className="text-blue-600 hover:underline">Volver a la tienda</a>
            <a href="/pedidos" className="text-blue-600 hover:underline">Ver mis pedidos</a>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-center text-gray-600">No se ha proporcionado un token de pago válido.</p>
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:underline">Volver a la tienda</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmPayment;
