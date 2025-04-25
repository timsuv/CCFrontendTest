import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

interface FormData {
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    userLastName: '',
    userEmail: '',
    userPhone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
    setIsLoading(true);
    
    try {
      // Validate form
      if (!formData.userName || !formData.userLastName || !formData.userEmail || !formData.password) {
        setError('Alla fält märkta med * är obligatoriska');
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Lösenorden matchar inte');
        setIsLoading(false);
        return;
      }
      
      if (formData.password.length < 8) {
        setError('Lösenordet måste vara minst 8 tecken långt');
        setIsLoading(false);
        return;
      }
      
      // Attempt registration
      const result = await register({
        userName: formData.userName,
        userLastName: formData.userLastName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        password: formData.password
      });
      
      if (result.success) {
        // Redirect to login page after successful registration
        navigate('/login', { state: { message: 'Registrering lyckades! Kontrollera din e-post för att verifiera ditt konto.' } });
      } else {
        setError(result.error || 'Registrering misslyckades. Försök igen.');
      }
    } catch (err) {
      setError('Ett fel inträffade. Försök igen.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Skapa konto</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-gray-700 font-medium mb-2">
              Förnamn *
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Ditt förnamn"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="userLastName" className="block text-gray-700 font-medium mb-2">
              Efternamn *
            </label>
            <input
              type="text"
              id="userLastName"
              name="userLastName"
              value={formData.userLastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Ditt efternamn"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="userEmail" className="block text-gray-700 font-medium mb-2">
              E-postadress *
            </label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Din e-postadress"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="userPhone" className="block text-gray-700 font-medium mb-2">
              Telefonnummer
            </label>
            <input
              type="tel"
              id="userPhone"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Ditt telefonnummer"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Lösenord *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Minst 8 tecken"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Bekräfta lösenord *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Upprepa lösenord"
              required
            />
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Fält markerade med * är obligatoriska
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading ? 'bg-blue-400' : 'bg-pink-400 hover:bg-pink-500'
            }`}
          >
            {isLoading ? 'Registrerar...' : 'Skapa konto'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Har du redan ett konto?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;