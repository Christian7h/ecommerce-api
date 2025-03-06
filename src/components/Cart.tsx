interface CartItem {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }
  
  interface CartProps {
    cart: {
      items: CartItem[];
    };
  }
  
  const Cart: React.FC<CartProps> = ({ cart }) => {
    const handleRemoveFromCart = async (productId: string) => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
  
      try {
        const response = await fetch(`https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/cart/remove/${productId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        });
  
        if (response.ok) {
          window.location.reload();
        } else {
          alert("Error al eliminar del carrito");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    const handleCheckout = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
  
      try {
        const response = await fetch("https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/orders/initiate", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
  
        if (response.ok) {
          window.location.href = `${data.url}?token_ws=${data.token}`; // Redirige a Transbank
        } else {
          alert("Error al iniciar el pago");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    return (
      <>
        <h1>Carrito de Compras</h1>
        <ul>
          {cart.items.length > 0 ? (
            cart.items.map((item) => (
              <li key={item.product._id}>
                {item.product.name} - Cantidad: {item.quantity} - $
                {item.product.price * item.quantity}
                <button onClick={() => handleRemoveFromCart(item.product._id)}>
                  Eliminar
                </button>
              </li>
            ))
          ) : (
            <p>No hay productos en el carrito.</p>
          )}
        </ul>
        <button onClick={handleCheckout}>Realizar Orden</button>
        <a href="/">Volver a Productos</a>
      </>
    );
  };
  
  export default Cart;
  