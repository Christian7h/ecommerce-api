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
  categories: Category[]; // Añadido para aceptar las categorías
  total: number;
}

const Inicio: React.FC<InicioProps> = ({ products, categories, total: initialTotal }) => {
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const fetchCartTotal = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) return;

      try {
        const res = await fetch("https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/cart/total", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener el total del carrito");
        setTotal(await res.json());
      } catch (error) {
        console.error(error);
      }
    };

    const pollingInterval = setInterval(fetchCartTotal, 3000);
    return () => clearInterval(pollingInterval);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <>
      <h1>Productos</h1>
      <a href="/carrito">Ver Carrito</a> | <a href="/pedidos">Mis Órdenes</a>
      
      {/* Mostrar lista de productos */}
      <ProductList products={products} />
      
      {/* Mostrar lista de categorías */}
      <CategoryList categories={categories} />

      <p>Cantidad de productos en carrito: <span>{total}</span></p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </>
  );
};

export default Inicio;
