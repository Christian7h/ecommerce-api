// src/components/CategoryList.tsx
import React from "react";

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <ul>
      {categories.map((category) => (
        <li key={category._id}>
          <strong>{category.name}</strong>
          {/* Usamos un enlace <a> para redirigir a la página de esa categoría */}
          <a href={`/category/${category._id}`} className="category-link">
            Ver Productos
          </a>
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;
