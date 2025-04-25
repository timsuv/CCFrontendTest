import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Define types
interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
}
interface UpdateProfileData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PurchaseItem {
  itemId: number;
  productName: string;
  productDescription: string;
}

interface Purchase {
  purchaseId: number;
  purchaseDate: string;
  price: number;
  items: PurchaseItem[];
}
interface UserRegistrationData {
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  password: string;
}

interface PasswordResetData {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: UserRegistrationData
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (
    resetData: PasswordResetData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  isAuthenticated: boolean;
  updateProfile: (profileData: UpdateProfileData) => Promise<{ success: boolean; data?: any; error?: string }>;
  getUserPurchases: () => Promise<{ success: boolean; purchases?: Purchase[]; error?: string }>;


}



interface AuthProviderProps {
  children: ReactNode;
}

// Create axios instance with credentials support
export const api = axios.create({
  baseURL: "https://localhost:7234",
  withCredentials: true, // Important for sending/receiving cookies
});

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        // Try to access an authenticated endpoint
        const response = await api.get("/Auth");
        if (response.status === 200) {
          // If successful, we are authenticated
          const userProfile = await getUserProfile();
          setUser(userProfile);
        }
      } catch (err) {
        // If error, we're not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const getUserPurchases = async (): Promise<{ success: boolean; purchases?: Purchase[]; error?: string }> => {
    try {
      const response = await api.get<Purchase[]>('/api/user/purchases');
      return { success: true, purchases: response.data };
    } catch (error: any) {
      console.error('Error fetching user purchases:', error);
      return { success: false, error: error.response?.data || 'Kunde inte hämta köphistorik' };
    }
  };

  const getUserProfile = async (): Promise<User | null> => {
    try {
      const response = await api.get<User>("/api/user/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };
  const updateProfile = async (
    profileData: UpdateProfileData
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setError(null);
      const response = await api.put('/api/user/profile', {
        name: profileData.name,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone
      });
      
      if (response.status === 200) {
        // Update the local user state with the new information
        setUser({
          ...user,
          name: profileData.name,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone
        });
        return { success: true, data: response.data };
      }
      return { success: false, error: "Failed to update profile" };
    } catch (error: any) {
      const errorMessage = error.response?.data || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const response = await api.post("/login", { email, password });

      if (response.status === 200) {
        const userProfile = await getUserProfile();
        setUser(userProfile);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error: any) {
      const errorMessage = error.response?.data || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post("/logout");
      setUser(null);
      window.location.href = '/login';

      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error);
      return { success: false, error: error.response?.data || "Logout failed" };
    }
  };

  const register = async (
    userData: UserRegistrationData
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setError(null);
      const response = await api.post("/register", userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await api.post<{ message: string }>('/api/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data || 'Failed to request password reset' };
    }
  };

  // Reset password
  const resetPassword = async (resetData: PasswordResetData): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await api.post<{ message: string }>('/api/reset-password', resetData);
      return { success: true, message: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data || 'Failed to reset password' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    getUserPurchases,
    isAuthenticated: !!user, // true if user is not null
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;


};
 export const useAuth = (): AuthContextType=>{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
 }
