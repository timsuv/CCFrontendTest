import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from './AuthContext';

interface ProfileFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

const Dashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.lastName || !formData.email) {
        setError('Namn, efternamn och e-post är obligatoriska fält');
        setIsLoading(false);
        return;
      }
      
      // Update profile
      const result = await updateProfile({
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });
      
      if (result.success) {
        setSuccess('Profilen har uppdaterats!');
        setEditing(false);
      } else {
        setError(result.error || 'Kunde inte uppdatera profilen. Försök igen.');
      }
    } catch (err) {
      setError('Ett fel inträffade. Försök igen.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

 

  // If no user data is available, show loading
  if (!user) {
    return <div className="p-8 text-center">Laddar användarprofil...</div>;
  }

  return (
    <div className=" p-6">
     

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Användarinformation</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded"
            >
              Redigera
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Förnamn
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                  Efternamn
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white font-medium ${
                  isLoading ? 'bg-blue-400' : 'bg-pink-400 hover:bg-pink-500'
                }`}
              >
                {isLoading ? 'Sparar...' : 'Spara ändringar'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  // Reset form data to original user data
                  if (user) {
                    setFormData({
                      name: user.name,
                      lastName: user.lastName,
                      email: user.email,
                      phone: user.phone
                    });
                  }
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Avbryt
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Namn</p>
              <p className="font-medium">{user.name} {user.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">E-post</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefon</p>
              <p className="font-medium">{user.phone || 'Ej angivet'}</p>
            </div>
          </div>
        )}
      </div>

      {/* You can add additional dashboard content here */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Din aktivitet</h2>
        <p>Välkommen till din dashboard! Här kan du se ditt innehåll.</p>
      </div>
    </div>
  );
};

export default Dashboard;