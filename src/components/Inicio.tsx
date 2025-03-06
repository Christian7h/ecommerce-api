import { useEffect, useState } from "react";
import ProductList from "./ProductList";
import CategoryList from "./CategoryList";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface InicioProps {
  products: Product[];
  categories: Category[];
  total: number;
}

const Inicio: React.FC<InicioProps> = ({ products, categories, total: initialTotal }) => {
  const [total, setTotal] = useState(initialTotal);

  const fetchCartTotal = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/total`, {	
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener el total del carrito");

      const data = await res.json();
      setTotal(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Se ejecuta al cargar el componente
  useEffect(() => {
    fetchCartTotal();
  }, []);

  // Función que se pasa a `ProductList` y `CategoryList` para actualizar el total cuando haya cambios
  const updateCartTotal = () => {
    fetchCartTotal();
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <>
      <h1>Productos</h1>
      <a href="/carrito">Ver Carrito</a> | <a href="/pedidos">Mis Órdenes</a>

      {/* Pasar `updateCartTotal` para actualizar el carrito en tiempo real */}
      <ProductList products={products} updateCartTotal={updateCartTotal} />
      <CategoryList categories={categories} />

      <p>Cantidad de productos en carrito: <span>{total}</span></p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </>
  );
};

export default Inicio;
