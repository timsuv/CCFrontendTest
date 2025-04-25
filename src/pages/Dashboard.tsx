import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { api } from '../components/AuthContext';
import UpdateProfile from '../components/UpdateProfile';
import PurchaseHistory from '../components/PurchaseHistory';

// Define a type for user profile
interface UserProfile {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

const Dashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // If we already have the user from AuthContext, use it
    if (user) {
      setProfile(user);
    } else {
      // Otherwise fetch it
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/profile');
      setProfile(response.data as UserProfile);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation should happen in the logout function itself
      // This prevents any race conditions
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback navigation if the logout function fails
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={fetchUserProfile}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Din information</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logga ut
        </button>
      </div>

      {profile && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Din profil hos Karriär Partner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Namn</p>
              <p className="font-medium">{profile.name} {profile.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">Mejladress</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefonnummer</p>
              <p className="font-medium">{profile.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}
    <div>

    </div>
      <UpdateProfile/>
      <PurchaseHistory/>
    </div>
  );
};

export default Dashboard;