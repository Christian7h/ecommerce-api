import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
  });

  // Cargar categorías
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Agregar timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/categories?_t=${timestamp}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        console.error('La respuesta no contiene un array de categorías:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar categorías');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar campos requeridos
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const categoryData = {
        name: formData.name.trim(),
      };

      const url = editingCategory
        ? `${import.meta.env.PUBLIC_API_URL}/categories/${editingCategory._id}`
        : `${import.meta.env.PUBLIC_API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la categoría');
      }

      alert(editingCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
      
      setFormData({
        name: '',
      });
      setEditingCategory(null);
      setShowModal(false);

      // Esperar un momento para que el backend limpie la caché
      setTimeout(() => {
        fetchCategories();
      }, 1000);

    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        // Si la respuesta no es ok, intentamos obtener el mensaje de error
        let errorMessage = 'Error al eliminar la categoría';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no podemos parsear la respuesta, usamos el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      // Si la respuesta es 204 (No Content) o si no podemos parsear el JSON, seguimos adelante
      let successMessage = 'Categoría eliminada exitosamente';
      try {
        const data = await response.json();
        successMessage = data.message || successMessage;
      } catch (e) {
        // Si no podemos parsear la respuesta, usamos el mensaje por defecto
      }

      setError('');
      alert(successMessage);

      // Esperar un momento para que el backend limpie la caché
      setTimeout(() => {
        fetchCategories();
      }, 1000);

    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la categoría');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 