import React, { useEffect } from "react";
import { useAppContext } from "./AppContext.tsx";

interface Order {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
  }
  
  interface OrdersProps {
    orders?: Order[];
  }
  
  const Orders: React.FC<OrdersProps> = ({ orders: propOrders }) => {
    const { loading } = useAppContext();
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>
        
        {loading.products ? (
          // Mostrar esqueletos de carga
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {propOrders && propOrders.length > 0 ? (
              propOrders.map((order) => (
                <div key={order._id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Pedido #{order._id.substring(0, 8)}</p>
                      <p className="font-semibold text-lg">${order.total}</p>
                      <p className="text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? 'Completado' : 
                         order.status === 'pending' ? 'Pendiente' : 
                         order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">No tienes pedidos realizados.</p>
                <a href="/" className="inline-block mt-4 text-blue-600 hover:underline">Ir a Comprar</a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  export default Orders;
  