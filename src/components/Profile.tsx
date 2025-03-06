import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface UserProfile {
  email: string;
  username: string;
  name?: string;
  phone?: string;
  address?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState<UserProfile>({
    email: '',
    username: '',
    name: '',
    phone: '',
    address: ''
  });

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Primero intentar cargar desde localStorage
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setProfile({
            email: parsedData.email || '',
            username: parsedData.username || '',
            name: parsedData.name || '',
            phone: parsedData.phone || '',
            address: parsedData.address || ''
          });
          setFormData({
            email: parsedData.email || '',
            username: parsedData.username || '',
            name: parsedData.name || '',
            phone: parsedData.phone || '',
            address: parsedData.address || ''
          });
        }

        // Luego intentar obtener datos actualizados del servidor
        const token = Cookies.get('token');
        if (token) {
          const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const updatedProfile = {
              email: data.email || '',
              username: data.username || '',
              name: data.name || '',
              phone: data.phone || '',
              address: data.address || ''
            };
            setProfile(updatedProfile);
            setFormData(updatedProfile);

            // Actualizar localStorage
            localStorage.setItem('user_data', JSON.stringify({
              ...JSON.parse(userData || '{}'),
              ...updatedProfile
            }));
          }
        }
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar la información del perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('No se pudo autenticar. Por favor, inicia sesión nuevamente.');
        return;
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Actualizar perfil local
        setProfile(formData);
        
        // Actualizar localStorage
        const userData = localStorage.getItem('user_data');
        if (userData) {
          localStorage.setItem('user_data', JSON.stringify({
            ...JSON.parse(userData),
            ...formData
          }));
        }
        
        setSuccessMessage('Perfil actualizado correctamente');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error al guardar el perfil:', err);
      setError('Error de conexión al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4 mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede cambiar</p>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 rounded-md text-white ${
                  isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile || {
                    email: '',
                    username: '',
                    name: '',
                    phone: '',
                    address: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                <p className="mt-1">{profile?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nombre de usuario</h3>
                <p className="mt-1">{profile?.username}</p>
              </div>
              
              {profile?.name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre completo</h3>
                  <p className="mt-1">{profile.name}</p>
                </div>
              )}
              
              {profile?.phone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <p className="mt-1">{profile.phone}</p>
                </div>
              )}
              
              {profile?.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                  <p className="mt-1">{profile.address}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 