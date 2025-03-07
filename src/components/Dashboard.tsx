import React from 'react';
import { Package, Tag, ShoppingBag, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta de Productos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Package className="text-blue-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Productos</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Gestiona el catálogo de productos de tu tienda.
          </p>
          <a 
            href="/admin/products" 
            className="block mt-4 bg-blue-500 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Gestionar Productos
          </a>
        </div>

        {/* Tarjeta de Categorías */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Tag className="text-green-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Categorías</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Organiza tus productos en categorías.
          </p>
          <a 
            href="/admin/categories" 
            className="block mt-4 bg-green-500 text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Gestionar Categorías
          </a>
        </div>

        {/* Tarjeta de Pedidos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <ShoppingBag className="text-purple-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Pedidos</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Revisa y gestiona los pedidos de tus clientes.
          </p>
          <a 
            href="/admin/orders" 
            className="block mt-4 bg-purple-500 text-white text-center py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Ver Pedidos
          </a>
        </div>

        {/* Tarjeta de Usuarios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="text-orange-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Usuarios</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Administra las cuentas de usuarios.
          </p>
          <a 
            href="/admin/users" 
            className="block mt-4 bg-orange-500 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Gestionar Usuarios
          </a>
        </div>
      </div>

      {/* Estadísticas o información adicional */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Resumen</h2>
        <p className="text-gray-600">
          Bienvenido al panel de administración. Desde aquí puedes gestionar todos los aspectos de tu tienda en línea.
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 