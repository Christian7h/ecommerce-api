import React from "react";
import Button from './Button.astro'; // Importar el botón

interface Props {
  _id: string;
  name: string;
  price: number;
  description: string;
}

const ProductCard: React.FC<Props> = ({
  _id,
  name,
  price,
  description,
}) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/cart/add`, {
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
    <div className="bg-white shadow-lg rounded-lg p-4 border">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-lg font-bold text-blue-500">${price}</p>
      
      {/* Usar el componente Button */}
      <Button
        text="Añadir al Carrito"
        onClick={() => handleAddToCart(_id)}
      />
    </div>
  );
};

export default ProductCard;
