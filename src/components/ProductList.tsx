// src/components/ProductList.tsx
import React from "react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch("https://nodejs-todo-api-e6206be79a01.herokuapp.com/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: productId, quantity: 1 }),
      });

      if (response.ok) {
        alert("Producto añadido al carrito");
      } else {
        alert("Error al añadir al carrito");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ul>
      {products.map((product) => (
        <li key={product._id}>
          <strong>{product.name}</strong>: {product.description} - $
          {product.price}
          <button onClick={() => handleAddToCart(product._id)}>
            Añadir al Carrito
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ProductList;
