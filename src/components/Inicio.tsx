import { useEffect, useState } from "react";
import ProductList from "./ProductList.tsx";
import CategoryList from "./CategoryList.tsx";
import { useAppContext } from "./AppContext.tsx";
import { Filter, Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface FilterState {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  search: string;
}

const Inicio: React.FC = () => {
  const { 
    products, 
    categories, 
    cartTotal, 
    loading,
    pagination,
    fetchProducts,
    fetchCategories,
    fetchCartTotal 
  } = useAppContext();

  // Estado para los filtros
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    minPrice: null,
    maxPrice: null,
    search: ""
  });

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(9);

  // Estado para productos filtrados
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // Estado para controlar la visibilidad de los filtros en móvil
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para controlar qué secciones de filtros están expandidas
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true
  });

  // Cargar categorías y productos al inicio
  useEffect(() => {
    fetchCategories();
    fetchCartTotal();
    // Cargar productos iniciales con la configuración de paginación actual
    fetchProducts(currentPage, productsPerPage);
  }, []);

  // Manejar cambios de página y productos por página
  useEffect(() => {
    if (filters.category) {
      fetchProductsByCategory(filters.category, currentPage, productsPerPage);
    } else {
      fetchProducts(currentPage, productsPerPage);
    }
  }, [currentPage, productsPerPage]);

  // Filtrar productos cuando cambien los filtros o los productos
  useEffect(() => {
    if (!products.length) return;
    
    // Si hay un filtro de categoría, obtener productos de esa categoría
    if (filters.category !== null) {
      fetchProductsByCategory(filters.category, currentPage, productsPerPage);
      return;
    }
    
    let result = [...products];
    
    // Filtrar por precio mínimo
    if (filters.minPrice !== null) {
      result = result.filter(product => product.price >= (filters.minPrice as number));
    }
    
    // Filtrar por precio máximo
    if (filters.maxPrice !== null) {
      result = result.filter(product => product.price <= (filters.maxPrice as number));
    }
    
    // Filtrar por término de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(searchLower) || 
          product.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProducts(result);
  }, [products, filters, currentPage, productsPerPage]);

  // Función para obtener productos por categoría
  const fetchProductsByCategory = async (categoryId: string, page = 1, limit = productsPerPage) => {
    setIsLoadingProducts(true);
    
    try {
      // Obtener token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (!token) return;
      
      // Hacer la petición directamente al backend
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/products?page=${page}&limit=${limit}&category=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Error al obtener productos por categoría");
      
      const data = await response.json();
      setFilteredProducts(data.products);
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      setFilteredProducts([]); // En caso de error, mostrar lista vacía
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string | null) => {
    setFilters(prev => ({
      ...prev,
      category: categoryId
    }));

    // Resetear a la primera página cuando se cambia de categoría
    setCurrentPage(1);

    // Actualizar el nombre de la categoría seleccionada
    if (categoryId === null) {
      setSelectedCategoryName(null);
    } else {
      const category = categories.find(cat => cat._id === categoryId);
      setSelectedCategoryName(category ? category.name : null);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambio de productos por página
  const handleProductsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setProductsPerPage(newLimit);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambio de precio mínimo
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      minPrice: value
    }));
  };

  // Manejar cambio de precio máximo
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setFilters(prev => ({
      ...prev,
      maxPrice: value
    }));
  };

  // Manejar cambio de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      search: ""
    });
    setSelectedCategoryName(null);
    setCurrentPage(1);
  };

  // Alternar la visibilidad de una sección de filtros
  const toggleSection = (section: 'categories' | 'price') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {selectedCategoryName ? `Productos en ${selectedCategoryName}` : 'Todos los Productos'}
        </h1>
        <div className="flex items-center">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center text-gray-600 mr-4"
          >
            <Filter size={18} className="mr-1" />
            Filtros
          </button>
          <a href="/carrito" className="text-blue-600 hover:underline mr-4">Ver Carrito</a>
          <a href="/pedidos" className="text-blue-600 hover:underline">Mis Pedidos</a>
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {(filters.category !== null || filters.minPrice !== null || filters.maxPrice !== null || filters.search) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          
          {filters.category !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {selectedCategoryName || 'Categoría'}
              <button 
                onClick={() => handleCategoryChange(null)} 
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          )}
          
          {filters.minPrice !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Desde ${filters.minPrice}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, minPrice: null }))} 
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          )}
          
          {filters.maxPrice !== null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Hasta ${filters.maxPrice}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, maxPrice: null }))} 
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          )}
          
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Búsqueda: {filters.search}
              <button 
                onClick={() => setFilters(prev => ({ ...prev, search: "" }))} 
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          )}
          
          <button 
            onClick={clearFilters}
            className="ml-auto text-sm text-blue-600 hover:underline"
          >
            Limpiar todos
          </button>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Selector de productos por página */}
      <div className="mb-4 flex justify-end">
        <div className="flex items-center">
          <label htmlFor="productsPerPage" className="mr-2 text-sm text-gray-600">
            Productos por página:
          </label>
          <select
            id="productsPerPage"
            value={productsPerPage}
            onChange={handleProductsPerPageChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtros - Versión móvil */}
        <div className={`md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 transition-opacity ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-white w-4/5 max-w-sm h-full overflow-y-auto transition-transform ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            {/* Contenido de filtros móvil */}
            <div className="p-4">
              {renderFilters()}
            </div>
          </div>
        </div>

        {/* Filtros - Versión escritorio */}
        <div className="hidden md:block w-1/4">
          {renderFilters()}
        </div>

        {/* Lista de productos */}
        <div className="flex-1">
          <ProductList 
            products={filteredProducts} 
            isLoading={isLoadingProducts || loading.products}
            onPageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={filters.category ? (filteredProducts.length > 0 ? Math.ceil(filteredProducts.length / productsPerPage) : 1) : pagination.totalPages}
          />
        </div>

        {/* Información del carrito */}
        <div className="w-full md:w-1/4">
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">Productos en carrito: 
              <span className="ml-2 text-blue-600">{cartTotal}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Función para renderizar los filtros (reutilizada en móvil y escritorio)
  function renderFilters() {
    return (
      <div className="space-y-6">
        {/* Filtro por categoría */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('categories')}
          >
            <h3 className="font-semibold">Categorías</h3>
            {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          
          {expandedSections.categories && (
            <div className="space-y-2 mt-3">
              <div 
                className={`px-3 py-2 rounded-md cursor-pointer ${filters.category === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleCategoryChange(null)}
              >
                Todas las categorías
              </div>
              
              {loading.categories ? (
                // Esqueleto de carga para categorías
                <div className="animate-pulse space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                categories.map(category => (
                  <div 
                    key={category._id}
                    className={`px-3 py-2 rounded-md cursor-pointer ${filters.category === category._id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    onClick={() => handleCategoryChange(category._id)}
                  >
                    {category.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Filtro por precio */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('price')}
          >
            <h3 className="font-semibold">Precio</h3>
            {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          
          {expandedSections.price && (
            <div className="space-y-4 mt-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice || ''}
                  onChange={handleMinPriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Precio mínimo"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice || ''}
                  onChange={handleMaxPriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Precio máximo"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Botón para limpiar filtros */}
        <button
          onClick={clearFilters}
          className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    );
  }
};

export default Inicio;
