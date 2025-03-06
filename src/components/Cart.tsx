import React, { useEffect, useState } from "react";
import { useAppContext } from "./AppContext.tsx";

interface CartProps {
  data?: any; // Datos precargados del carrito
}

const Cart: React.FC<CartProps> = ({ data }) => {
  const { cart, loading, removeFromCart, fetchCart } = useAppContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [localCart, setLocalCart] = useState<any>(null);

  useEffect(() => {
    // Intentar cargar desde localStorage primero
    const cachedCart = localStorage.getItem('cart');
    if (cachedCart) {
      try {
        const parsedCart = JSON.parse(cachedCart);
        setLocalCart(parsedCart);
      } catch (e) {
        console.error("Error al parsear el carrito en caché:", e);
      }
    } else if (data) {
      // Si no hay datos en localStorage pero tenemos datos precargados
      setLocalCart(data);
    }
    
    // Cargar datos frescos
    fetchCart();
  }, []);

  // Actualizar localCart cuando cart cambie
  useEffect(() => {
    if (cart && cart.items) {
      setLocalCart(cart);
    }
  }, [cart]);

  // Calcular el total del carrito y actualizar el contador
  useEffect(() => {
    if (localCart && localCart.items) {
      const count = localCart.items.reduce((total: number, item: any) => total + item.quantity, 0);
      // Disparar un evento personalizado para notificar la actualización del carrito
      const event = new CustomEvent('cartUpdated', { detail: { total: count } });
      window.dispatchEvent(event);
    }
  }, [localCart]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/orders/initiate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = `${data.url}?token_ws=${data.token}`; // Redirige a Transbank
      } else {
        alert("Error al iniciar el pago");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsCheckingOut(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  // Si no tenemos datos ni del caché ni de la API, mostrar esqueleto
  if (!localCart && loading.cart) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Carrito de Compras</h1>
        <div className="animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg bg-white">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calcular el total del carrito
  const calculateTotal = () => {
    if (!localCart || !localCart.items || localCart.items.length === 0) return 0;
    return localCart.items.reduce((total: number, item: any) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Carrito de Compras</h1>
      
      {localCart && localCart.items && localCart.items.length > 0 ? (
        <div>
          <div className="space-y-4">
            {localCart.items.map((item: any) => (
              <div key={item.product._id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  <p className="font-bold text-blue-500">${item.product.price * item.quantity}</p>
                </div>
                <button 
                  onClick={() => handleRemoveItem(item.product._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  disabled={loading.cart}
                >
                  Eliminar
                </button>
              </div>
            ))}
            
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-blue-600">${calculateTotal()}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || loading.cart}
                className={`w-full ${
                  isCheckingOut ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold py-2 rounded-lg transition-all flex justify-center items-center`}
              >
                {isCheckingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : 'Realizar Orden'}
              </button>
            </div>
          </div>
          
          <a href="/" className="block mt-4 text-center text-blue-600 hover:underline">
            Volver a la tienda
          </a>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-600">No hay productos en el carrito.</p>
          <a href="/" className="inline-block mt-4 text-blue-600 hover:underline">Volver a Productos</a>
        </div>
      )}
    </div>
  );
};

export default Cart;
  