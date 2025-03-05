// src/components/ConfirmPayment.tsx
import { useEffect, useState } from "react";

interface Result {
  status: string;
  orderId: string;
  amount: number;
  message: string;
}

interface ConfirmPaymentProps {
  tokenWs: string | null;
  token: string;
}

const ConfirmPayment: React.FC<ConfirmPaymentProps> = ({ tokenWs, token }) => {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (tokenWs) {
        try {
          const response = await fetch("https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/orders/confirm", {
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
        }
      }
    };

    confirmPayment();
  }, [tokenWs, token]);

  return (
    <div>
      {result ? (
        result.status === "AUTHORIZED" ? (
          <p>
            Pago exitoso. Orden #{result.orderId} creada por ${result.amount}.
          </p>
        ) : (
          <p>Error en el pago: {result.message || "Intenta de nuevo"}</p>
        )
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default ConfirmPayment;
