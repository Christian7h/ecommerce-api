import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Category {
  _id: string;
  name: string;
}

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

interface AppContextType {
  products: any[];
  categories: any[];
  cart: any;
  cartTotal: number;
  loading: {
    products: boolean;
    categories: boolean;
    cart: boolean;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  fetchProducts: (page?: number, limit?: number, category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCart: () => Promise<void>;
  fetchCartTotal: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  addToCartWithQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  user: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any>({ items: [] });
  const [cartTotal, setCartTotal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({
    products: false,
    categories: false,
    cart: false
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row: string) => row.startsWith("token="))
      ?.split("=")[1];
  };

  const fetchProducts = async (page = 1, limit = 10, category?: string) => {
    const token = getToken();
    if (!token) return;

    setLoading(prev => ({ ...prev, products: true }));
    try {
      // Construir la URL con parámetros de paginación y categoría
      let url = `${import.meta.env.PUBLIC_API_URL}/products?page=${page}&limit=${limit}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Error al obtener productos");
      
      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchCategories = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchCart = async () => {
    const token = getToken();
    if (!token) return;

    // Intentar cargar desde localStorage primero
    const cachedCart = localStorage.getItem('cart');
    const timestamp = localStorage.getItem('cartTimestamp');
    
    // Verificar si tenemos datos en caché y si son recientes (menos de 5 minutos)
    if (cachedCart && timestamp) {
      const cachedTime = new Date(timestamp).getTime();
      const now = new Date().getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - cachedTime < fiveMinutes) {
        try {
          const parsedCart = JSON.parse(cachedCart);
          setCart(parsedCart);
          return;
        } catch (e) {
          console.error("Error al parsear el carrito en caché:", e);
        }
      }
    }

    setLoading(prev => ({ ...prev, cart: true }));
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener carrito");
      const data = await response.json();
      setCart(data);
      
      // Guardar en localStorage con timestamp
      localStorage.setItem('cart', JSON.stringify(data));
      localStorage.setItem('cartTimestamp', new Date().toISOString());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const fetchCartTotal = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/total`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener total del carrito");
      const data = await response.json();
      setCartTotal(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = async (productId: string) => {
    const token = getToken();
    if (!token) return;

    // Optimista: actualizar UI inmediatamente
    const productToAdd = products.find(p => p._id === productId);
    if (productToAdd) {
      // Crear una copia del carrito actual
      const updatedCart = { ...cart };
      
      // Buscar si el producto ya está en el carrito
      const existingItemIndex = updatedCart.items.findIndex(
        (item: { product: { _id: string } }) => item.product._id === productId
      );
      
      if (existingItemIndex >= 0) {
        // Incrementar cantidad si ya existe
        updatedCart.items[existingItemIndex].quantity += 1;
      } else {
        // Añadir nuevo item si no existe
        updatedCart.items.push({
          product: {
            _id: productToAdd._id,
            name: productToAdd.name,
            price: productToAdd.price
          },
          quantity: 1
        });
      }
      
      // Actualizar estado
      setCart(updatedCart);
      setCartTotal(prev => prev + 1);
      
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.setItem('cartTimestamp', new Date().toISOString());
      
      // Disparar un evento personalizado para notificar la actualización del carrito
      const event = new CustomEvent('cartUpdated', { detail: { total: cartTotal + 1 } });
      window.dispatchEvent(event);
    }

    // Realizar la petición en segundo plano
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity: 1 }),
      });

      if (!response.ok) {
        console.error("Error al añadir al carrito");
        // Si hay error, recargar datos del servidor
        await fetchCart();
        await fetchCartTotal();
      }
    } catch (error) {
      console.error("Error:", error);
      // Si hay error, recargar datos del servidor
      await fetchCart();
      await fetchCartTotal();
    }
  };

  const addToCartWithQuantity = async (productId: string, quantity: number) => {
    const token = getToken();
    if (!token) return;

    // Optimista: actualizar UI inmediatamente
    const productToAdd = products.find(p => p._id === productId);
    if (productToAdd) {
      // Crear una copia del carrito actual
      const updatedCart = { ...cart };
      
      // Buscar si el producto ya está en el carrito
      const existingItemIndex = updatedCart.items.findIndex(
        (item: { product: { _id: string } }) => item.product._id === productId
      );
      
      if (existingItemIndex >= 0) {
        // Incrementar cantidad si ya existe
        updatedCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Añadir nuevo item si no existe
        updatedCart.items.push({
          product: {
            _id: productToAdd._id,
            name: productToAdd.name,
            price: productToAdd.price
          },
          quantity: quantity
        });
      }
      
      // Actualizar estado
      setCart(updatedCart);
      setCartTotal(prev => prev + quantity);
      
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.setItem('cartTimestamp', new Date().toISOString());
      
      // Disparar un evento personalizado para notificar la actualización del carrito
      const event = new CustomEvent('cartUpdated', { detail: { total: cartTotal + quantity } });
      window.dispatchEvent(event);
    }

    // Realizar la petición en segundo plano
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity: quantity }),
      });

      if (!response.ok) {
        console.error("Error al añadir al carrito");
        // Si hay error, recargar datos del servidor
        await fetchCart();
        await fetchCartTotal();
      }
    } catch (error) {
      console.error("Error:", error);
      // Si hay error, recargar datos del servidor
      await fetchCart();
      await fetchCartTotal();
    }
  };

  const removeFromCart = async (productId: string) => {
    const token = getToken();
    if (!token) return;

    // Optimista: actualizar UI inmediatamente
    const updatedCart = { ...cart };
    const itemIndex = updatedCart.items.findIndex((item: { product: { _id: string } }) => item.product._id === productId);
    
    if (itemIndex >= 0) {
      const quantity = updatedCart.items[itemIndex].quantity;
      updatedCart.items.splice(itemIndex, 1);
      
      // Actualizar estado
      setCart(updatedCart);
      setCartTotal(prev => prev - quantity);
      
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.setItem('cartTimestamp', new Date().toISOString());
      
      // Disparar un evento personalizado para notificar la actualización del carrito
      const event = new CustomEvent('cartUpdated', { detail: { total: cartTotal - quantity } });
      window.dispatchEvent(event);
    }

    // Realizar la petición en segundo plano
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("Error al eliminar del carrito");
        // Si hay error, recargar datos del servidor
        await fetchCart();
        await fetchCartTotal();
      }
    } catch (error) {
      console.error("Error:", error);
      // Si hay error, recargar datos del servidor
      await fetchCart();
      await fetchCartTotal();
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    const token = getToken();
    if (!token) return;

    // Optimista: actualizar UI inmediatamente
    const updatedCart = { ...cart };
    const itemIndex = updatedCart.items.findIndex((item: { product: { _id: string } }) => item.product._id === productId);
    
    if (itemIndex >= 0) {
      updatedCart.items[itemIndex].quantity = quantity;
      
      // Actualizar estado
      setCart(updatedCart);
      setCartTotal(prev => prev + quantity - cart.items[itemIndex].quantity);
      
      // Guardar en localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.setItem('cartTimestamp', new Date().toISOString());
      
      // Disparar un evento personalizado para notificar la actualización del carrito
      const event = new CustomEvent('cartUpdated', { detail: { total: cartTotal + quantity - cart.items[itemIndex].quantity } });
      window.dispatchEvent(event);
    }

    // Realizar la petición en segundo plano
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/update/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        console.error("Error al actualizar cantidad del carrito");
        // Si hay error, recargar datos del servidor
        await fetchCart();
        await fetchCartTotal();
      }
    } catch (error) {
      console.error("Error:", error);
      // Si hay error, recargar datos del servidor
      await fetchCart();
      await fetchCartTotal();
    }
  };

  const login = async (email: string, password: string) => {
    const token = getToken();
    if (!token) return false;

    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Error al iniciar sesión");

      const data = await response.json();
      setIsAuthenticated(true);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const register = async (userData: any) => {
    const token = getToken();
    if (!token) return false;

    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Error al registrar usuario");

      const data = await response.json();
      setIsAuthenticated(true);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const logout = () => {
    const token = getToken();
    if (!token) return;

    setLoading(prev => ({ ...prev, products: true }));
    try {
      fetch(`${import.meta.env.PUBLIC_API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(response => {
        if (!response.ok) throw new Error("Error al cerrar sesión");
        setIsAuthenticated(false);
        setUser(null);
      }).catch(error => {
        console.error("Error:", error);
      }).finally(() => {
        setLoading(prev => ({ ...prev, products: false }));
      });
    } catch (error) {
      console.error("Error:", error);
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Cargar datos desde localStorage al inicio
  useEffect(() => {
    const loadCachedData = () => {
      try {
        // Cargar carrito desde caché
        const cachedCart = localStorage.getItem('cart');
        if (cachedCart) {
          const { data, timestamp } = JSON.parse(cachedCart);
          // Verificar si los datos tienen menos de 30 segundos
          if (Date.now() - timestamp < 30 * 1000) {
            setCart(data);
          }
        }

        // Verificar si hay un token en las cookies
        const token = document.cookie
          .split("; ")
          .find((row: string) => row.startsWith("token="))
          ?.split("=")[1];

        if (token) {
          // Cargar total del carrito
          fetch(`${import.meta.env.PUBLIC_API_URL}/cart/total`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(response => response.json())
            .then(data => setCartTotal(data))
            .catch(error => console.error(error));
        }
      } catch (error) {
        console.error("Error al cargar datos desde caché:", error);
      }
    };

    loadCachedData();
    
    // Cargar datos frescos
    fetchProducts();
    fetchCategories();
    fetchCart();
    fetchCartTotal();
  }, []);

  const contextValue: AppContextType = {
    products,
    categories,
    cart,
    cartTotal,
    loading,
    pagination,
    fetchProducts,
    fetchCategories,
    fetchCart,
    fetchCartTotal,
    addToCart,
    addToCartWithQuantity,
    removeFromCart,
    updateCartItemQuantity,
    login,
    register,
    logout,
    isAuthenticated,
    user
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}; 