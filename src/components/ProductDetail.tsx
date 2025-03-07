import React, { useEffect, useState } from "react";
import { useAppContext } from "./AppContext.tsx";

interface ProductDetailProps {
  productId?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const { fetchCart, fetchCartTotal } = useAppContext();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/products/${productId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error("Error al obtener detalles del producto");
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || !productId) return;
    
    setAddingToCart(true);
    
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (!token) {
        console.error("No se encontró el token");
        return;
      }
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity: quantity }),
      });
      
      if (response.ok) {
        setAddedToCart(true);
        
        // Actualizar el carrito y el contador
        await fetchCart();
        await fetchCartTotal();
        
        // Actualizar localStorage con los datos del carrito
        try {
          const cartDataResponse = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartDataResponse.ok) {
            const cartData = await cartDataResponse.json();
            localStorage.setItem('cart', JSON.stringify(cartData));
            localStorage.setItem('cartTimestamp', new Date().toISOString());
          }
        } catch (error) {
          console.error("Error al obtener datos del carrito:", error);
        }
        
        // Disparar un evento personalizado para actualizar el contador del carrito
        try {
          const cartResponse = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/total`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartResponse.ok) {
            const total = await cartResponse.json();
            const event = new CustomEvent('cartUpdated', { detail: { total } });
            window.dispatchEvent(event);
          }
        } catch (error) {
          console.error("Error al obtener total del carrito:", error);
        }
        
        // Mostrar mensaje de éxito por 3 segundos
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      } else {
        console.error("Error al añadir al carrito");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Imagen del producto */}
              <div className="w-full md:w-1/2 h-80 bg-gray-200 rounded-lg"></div>
              
              {/* Detalles del producto */}
              <div className="w-full md:w-1/2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Producto no encontrado</h2>
        <p className="mt-4">No se pudo encontrar el producto solicitado.</p>
        <a href="/" className="inline-block mt-4 text-blue-600 hover:underline">Volver a la tienda</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Imagen del producto con zoom y galería */}
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="relative h-96 group">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-4 h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="block mt-4 text-gray-500 font-medium">Imagen no disponible</span>
                  </div>
                )}
                {product.image && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Detalles del producto */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-col h-full">
              {/* Encabezado */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">${product.price}</p>
                  </div>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      En Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripción del Producto</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              {/* Selector de cantidad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <div className="flex items-center">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-r-2 border-gray-200"
                      aria-label="Disminuir cantidad"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <div className="px-6 py-2 font-medium text-center min-w-[60px] bg-white">{quantity}</div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-l-2 border-gray-200"
                      aria-label="Aumentar cantidad"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subtotal */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Botón de añadir al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  addingToCart ? 'bg-gray-400 cursor-not-allowed' : 
                  addedToCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } shadow-lg hover:shadow-xl`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Añadiendo al Carrito...
                  </>
                ) : addedToCart ? (
                  <>
                    <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ¡Añadido al Carrito!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Añadir al Carrito
                  </>
                )}
              </button>
              
              {/* Enlaces de navegación */}
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
                <a 
                  href="/" 
                  className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Volver a la Tienda
                </a>
                <a 
                  href="/carrito" 
                  className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors"
                >
                  Ver Carrito
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 