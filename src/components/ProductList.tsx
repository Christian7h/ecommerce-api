import React from "react";
import { useAppContext } from "./AppContext.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface ProductListProps {
  products?: Product[]; // Productos pasados como prop
  categoryId?: string;  // ID de la categoría para cargar desde localStorage
  isLoading?: boolean;  // Estado de carga
  onPageChange?: (page: number) => void; // Callback para cambio de página
  currentPage?: number; // Página actual
  totalPages?: number; // Total de páginas
}

const ProductList: React.FC<ProductListProps> = ({ 
  products: propProducts, 
  categoryId, 
  isLoading: propIsLoading,
  onPageChange,
  currentPage: propCurrentPage,
  totalPages: propTotalPages
}) => {
  const { products: contextProducts, loading, pagination, addToCart } = useAppContext();
  
  // Determinar qué productos mostrar
  // Prioridad: 1. propProducts, 2. contextProducts
  const products = propProducts || contextProducts;

  // Determinar si estamos cargando
  const isLoading = propIsLoading || (!propProducts && loading.products);

  // Determinar información de paginación
  const currentPage = propCurrentPage || pagination.currentPage;
  const totalPages = propTotalPages || pagination.totalPages;

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {isLoading ? (
          // Mostrar esqueletos de carga
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="bg-white shadow-lg rounded-lg p-4 border">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-lg font-bold text-blue-500">${product.price}</p>
              <a 
                href={`/product/${product._id}`}
                className="block text-center text-blue-600 hover:underline mb-2"
              >
                Ver detalles
              </a>
              <button
                onClick={() => addToCart(product._id)}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Añadir al Carrito
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-lg text-gray-600">No hay productos disponibles.</p>
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      {!isLoading && products && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Mostrar números de página */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              // Lógica para mostrar páginas alrededor de la actual
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = index + 1;
              } else if (currentPage <= 3) {
                pageToShow = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + index;
              } else {
                pageToShow = currentPage - 2 + index;
              }
              
              // Solo mostrar si está en rango
              if (pageToShow > 0 && pageToShow <= totalPages) {
                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`w-10 h-10 flex items-center justify-center rounded-md ${
                      currentPage === pageToShow
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            aria-label="Página siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
