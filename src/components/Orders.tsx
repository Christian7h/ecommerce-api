interface Order {
    _id: string;
    total: number;
    status: string;
  }
  
  interface OrdersProps {
    orders: Order[];
  }
  
  const Orders: React.FC<OrdersProps> = ({ orders }) => {
    return (
      <>
        <h1>Mis Órdenes</h1>
        <ul>
          {orders.length > 0 ? (
            orders.map((order) => (
              <li key={order._id}>
                Orden #{order._id} - Total: ${order.total} - Estado: {order.status}
              </li>
            ))
          ) : (
            <p>No tienes órdenes aún.</p>
          )}
        </ul>
        <a href="/">Volver a Productos</a>
      </>
    );
  };
  
  export default Orders;
  