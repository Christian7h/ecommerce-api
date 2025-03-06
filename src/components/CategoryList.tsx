// src/components/CategoryList.tsx
import React from "react";
import { useAppContext } from "./AppContext.tsx";

interface Category {
  _id: string;
  name: string;
}

interface CategoryListProps {
  categories?: Category[];
}

const CategoryList: React.FC = () => {
  const { categories } = useAppContext();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Categorías</h2>
      <ul className="space-y-1">
        {categories.map((category) => (
          <li key={category._id}>
            <a
              href={`/category/${category._id}`}
              className="text-blue-600 hover:underline"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
