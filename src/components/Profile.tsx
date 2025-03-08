import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Loader, Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const { userProfile, fetchUserProfile, updateUserProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    picture: ''
  });

  // Cargar datos del perfil solo una vez al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      if (!userProfile) {
        setIsLoading(true);
        setError(null);
        try {
          const profile = await fetchUserProfile();
          if (profile) {
            setFormData({
              name: profile.name || '',
              phone: profile.phone || '',
              address: profile.address || '',
              picture: profile.picture || ''
            });
            if (profile.picture) {
              setImagePreview(profile.picture);
            }
          }
        } catch (err) {
          setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
          console.error('Error al cargar perfil:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Si ya tenemos el perfil, solo actualizamos el formulario
        setFormData({
          name: userProfile.name || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          picture: userProfile.picture || ''
        });
        if (userProfile.picture) {
          setImagePreview(userProfile.picture);
        }
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []); // Solo se ejecuta al montar el componente

  // Actualizar formulario cuando cambie userProfile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        picture: userProfile.picture || ''
      });
      if (userProfile.picture) {
        setImagePreview(userProfile.picture);
      }
    }
  }, [userProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let pictureUrl = formData.picture;

      // Si hay una nueva imagen seleccionada, súbela primero
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al subir la imagen');
        }

        const data = await response.json();
        pictureUrl = data.url;
      }

      // Actualizar el perfil con todos los datos, incluyendo la nueva URL de la imagen
      const updatedProfile = await updateUserProfile({
        ...formData,
        picture: pictureUrl
      });

      if (updatedProfile) {
        setSuccessMessage('¡Perfil actualizado con éxito!');
        setIsEditing(false);
        setSelectedImage(null);
      } else {
        throw new Error('No se pudo actualizar el perfil');
      }
    } catch (err) {
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      console.error('Error al actualizar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex justify-center">
              <div 
                className="relative group cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview}
                      alt={userProfile?.name || 'Foto de perfil'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
                {isEditing && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                )}
              </div>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold">
              {userProfile?.name || userProfile?.username || 'Usuario'}
            </h2>
            <p className="mt-2 text-center text-white/80">
              {userProfile?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                <span className="text-sm">{userProfile?.email}</span>
              </div>
              {userProfile?.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" />
                  <span className="text-sm">{userProfile.phone}</span>
                </div>
              )}
              {userProfile?.address && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span className="text-sm">{userProfile.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Información de Perfil</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Tu dirección"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-sm text-gray-900">{userProfile?.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nombre de usuario</h4>
                  <p className="mt-1 text-sm text-gray-900">{userProfile?.username}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nombre completo</h4>
                  <p className="mt-1 text-sm text-gray-900">{userProfile?.name || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                  <p className="mt-1 text-sm text-gray-900">{userProfile?.phone || 'No especificado'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Dirección</h4>
                  <p className="mt-1 text-sm text-gray-900">{userProfile?.address || 'No especificada'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 