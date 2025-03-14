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
          // Esqueletos de carga mejorados
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 animate-pulse">
              <div className="h-40 bg-gray-200 w-full"></div>
              <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
                <div className="h-8 bg-gray-100 rounded w-full mt-4"></div>
              </div>
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              {/* Espacio para imagen del producto (en un futuro) */}
              <div className="h-40 bg-gray-50 flex items-center justify-center">
                <img src={product.imageUrl} alt="" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-semibold text-blue-600">${product.price}</p>
                  <a 
                    href={`/product/${product._id}`}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                  >
                    Ver detalle
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500">No hay productos disponibles en esta categoría.</p>
            <p className="text-sm text-gray-400 mt-2">Intenta con otra categoría o vuelve más tarde.</p>
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      {!isLoading && products && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            } transition-colors duration-200`}
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
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    } transition-colors duration-200`}
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
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            } transition-colors duration-200`}
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
