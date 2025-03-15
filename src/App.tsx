import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { AppProvider } from './components/AppContext.tsx';
import Inicio from './components/Inicio.tsx';
import Cart from './components/Cart.tsx';
import CategoryList from './components/CategoryList.tsx';
import Orders from './components/Orders.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import ConfirmPayment from './components/ConfirmPayment.tsx';
import ProductList from './components/ProductList.tsx';
import Profile from './components/Profile.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProductManager from './components/ProductManager.tsx';
import CategoryManager from './components/CategoryManager.tsx';

import { useAppContext } from './components/AppContext.tsx';
// Importamos los iconos de Lucide React
import { ShoppingCart, Home, Package, Grid, Menu, X, User, LogOut } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface AppProps {
  page?: string;
  data?: any;
  id?: string;
  tokenWs?: string | null;
  payment_id?: string | null;
  status?: string | null;
  preference_id?: string | null;
  paymentType?: 'webpay' | 'mercadopago';
}

export const App: React.FC<AppProps> = ({ 
  page = 'home', 
  data, 
  id, 
  tokenWs,
  payment_id,
  status,
  preference_id,
  paymentType = 'webpay'
}) => {
  const [currentPage, setCurrentPage] = useState<ReactElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        // Obtener información del usuario desde el token
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);
          setIsLoggedIn(true);
          setIsAdmin(payload.role === 'admin');
          
          // Si es la primera vez que se logea, redirigir según el rol
          if (window.location.pathname === '/login') {
            if (payload.role === 'admin') {
              window.location.href = '/admin/dashboard';
            } else {
              window.location.href = '/';
            }
          }
          
          // Intentar obtener el username desde localStorage primero
          try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
              const parsedUserData = JSON.parse(userData);
              if (parsedUserData.username) {
                setUsername(parsedUserData.username);
              } else {
                // Si no hay username en localStorage, usar el del token
                setUsername(payload.name || "Usuario");
              }
            } else {
              // Si no hay datos en localStorage, usar el del token
              setUsername(payload.name || "Usuario");
            }
          } catch (localStorageError) {
            console.error("Error al leer localStorage:", localStorageError);
            setUsername(payload.name || "Usuario");
          }
          
          // Obtener cantidad de productos en el carrito
          fetchCartCount(token);
        } catch (e) {
          console.error("Error al decodificar token:", e);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    
    // Verificar autenticación cuando la ventana recupera el foco
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  // Función para obtener la cantidad de productos en el carrito
  const fetchCartCount = async (token: string) => {
    // Intentar obtener del localStorage primero
    try {
      const cachedCart = localStorage.getItem('cart');
      if (cachedCart) {
        const parsedCart = JSON.parse(cachedCart);
        if (parsedCart && parsedCart.items) {
          const count = parsedCart.items.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartCount(count);
          return; // Si tenemos datos en localStorage, no necesitamos hacer la petición
        }
      }
    } catch (e) {
      console.error("Error al leer el carrito desde localStorage:", e);
    }

    // Si no hay datos en localStorage o hubo un error, obtener del servidor
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/total`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const total = await response.json();
        setCartCount(total);
      }
    } catch (error) {
      console.error("Error al obtener cantidad del carrito:", error);
    }
  };

  // Cargar categorías al inicio
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) return;

        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategories();
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar la cookie de token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Limpiar localStorage
    localStorage.clear(); // Eliminar todos los datos de localStorage
    
    // Redirigir a la página de login
    window.location.href = "/login";
  };

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      const { total } = event.detail;
      setCartCount(total);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  // Cerrar el menú móvil cuando se cambia de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  // Intentar cargar el contador del carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const cachedCart = localStorage.getItem('cart');
      if (cachedCart) {
        const parsedCart = JSON.parse(cachedCart);
        if (parsedCart && parsedCart.items) {
          const count = parsedCart.items.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartCount(count);
        }
      }
    } catch (e) {
      console.error("Error al leer el carrito desde localStorage al iniciar:", e);
    }
  }, []);

  useEffect(() => {
    // Determinar qué página mostrar basado en la prop page
    switch (page) {
      case 'home':
        setCurrentPage(<Inicio />);
        break;
      case 'cart':
        setCurrentPage(<Cart />);
        break;
      case 'categories':
        setCurrentPage(<CategoryList />);
        break;
      case 'admin-dashboard':
        setCurrentPage(<Dashboard />);
        break;
      case 'admin-products':
        setCurrentPage(<ProductManager />);
        break;
      case 'admin-categories':
        setCurrentPage(<CategoryManager/>);
        break;
      case 'category':
        // Obtener el nombre de la categoría si está disponible
        let categoryName = "Categoría";
        if (id) {
          // Intentar encontrar la categoría en el contexto
          const category = categories.find((cat: Category) => cat._id === id);
          if (category) {
            categoryName = category.name;
          }
        }
        
        setCurrentPage(
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Productos en {categoryName}</h1>
            <ProductList products={data} categoryId={id} />
            <a href="/" className="inline-block mt-4 text-blue-600 hover:underline">Volver a la tienda</a>
          </div>
        );
        break;
      case 'product':
        setCurrentPage(<ProductDetail productId={id || ""} />);
        break;
      case 'orders':
        setCurrentPage(<Orders orders={data} />);
        break;
      case 'confirm-payment':
        if (paymentType === 'mercadopago') {
          setCurrentPage(<ConfirmPayment 
            tokenWs={null} 
            payment_id={payment_id} 
            status={status} 
            preference_id={preference_id} 
            paymentType="mercadopago" 
          />);
        } else {
          setCurrentPage(<ConfirmPayment tokenWs={tokenWs || null} paymentType="webpay" />);
        }
        break;
      case 'profile':
        setCurrentPage(<Profile />);
        break;
      default:
        setCurrentPage(<Inicio />);
    }
  }, [page, data, id, tokenWs, payment_id, status, preference_id, paymentType, categories]);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto p-4">
            <nav className="flex justify-between items-center">
              {/* Logo */}
              <a href="/" className="text-xl font-bold text-blue-600 flex items-center z-10">
                <span className="mr-2">E-Commerce</span>
              </a>
              
              {/* Botón de menú móvil */}
              <button 
                className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Menú de navegación para escritorio */}
              <div className="hidden md:flex space-x-4 items-center">
                <a href="/" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Home size={18} className="mr-1" />
                  {/* <span>Inicio</span> */}
                </a>
                <a href="/categorias" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Grid size={18} className="mr-1" />
                  {/* <span>Categorías</span> */}
                </a>
                <a href="/pedidos" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Package size={18} className="mr-1" />
                  {/* <span>Mis Pedidos</span> */}
                </a>
                <a href="/carrito" className="text-gray-600 hover:text-blue-600 flex items-center relative">
                  <ShoppingCart size={20} className="mr-1" />
                  {/* <span>Carrito</span> */}
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </a>
                
                {isLoggedIn ? (
                  <div className="flex items-center ml-4">
                    <span className="text-sm text-gray-600 mr-2">Hola, {username}</span>
                    <a 
                      href="/profile" 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm mr-2"
                    >
                      Mi Perfil
                    </a>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2 ml-4">
                    <a 
                      href="/login" 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Iniciar Sesión
                    </a>
                    <a 
                      href="/register" 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Registrarse
                    </a>
                  </div>
                )}
              </div>
              
              {/* Menú móvil */}
              <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-between items-center mb-8">
                    <a href="/" className="text-xl font-bold text-blue-600">E-Commerce</a>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-600 hover:text-blue-600 focus:outline-none"
                      aria-label="Cerrar menú"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col space-y-6">
                    <a href="/" className="text-gray-800 hover:text-blue-600 flex items-center text-lg">
                      <Home size={20} className="mr-3" />
                      <span>Inicio</span>
                    </a>
                    <a href="/categorias" className="text-gray-800 hover:text-blue-600 flex items-center text-lg">
                      <Grid size={20} className="mr-3" />
                      <span>Categorías</span>
                    </a>
                    <a href="/pedidos" className="text-gray-800 hover:text-blue-600 flex items-center text-lg">
                      <Package size={20} className="mr-3" />
                      <span>Mis Pedidos</span>
                    </a>
                    <a href="/carrito" className="text-gray-800 hover:text-blue-600 flex items-center text-lg relative">
                      <ShoppingCart size={20} className="mr-3" />
                      <span>Carrito</span>
                      {cartCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </a>
                  </div>
                  
                  <div className="mt-auto">
                    {isLoggedIn ? (
                      <div className="flex flex-col space-y-4">
                        <div className="text-gray-600 mb-2">
                          Hola, <span className="font-semibold">{username}</span>
                        </div>
                        <a 
                          href="/profile" 
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <User size={18} className="mr-2" />
                          Mi Perfil
                        </a>
                        <button 
                          onClick={handleLogout}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <LogOut size={18} className="mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4">
                        <a 
                          href="/login" 
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center"
                        >
                          Iniciar Sesión
                        </a>
                        <a 
                          href="/register" 
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-center"
                        >
                          Registrarse
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          {currentPage}
        </main>
        
        <footer className="bg-white shadow-inner mt-8 py-4">
          <div className="container mx-auto text-center text-gray-500">
            <p>© {new Date().getFullYear()} E-Commerce. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;