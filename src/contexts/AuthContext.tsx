import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- START FIX ---
// Define your API base URL here.
// IMPORTANT: Use your laptop's actual IP address and your backend's port.
// For development, it's good practice to get this from an environment variable.
// Example for Vite:
const API_BASE_URL = import.meta.env.VITE_API_URL; // Fallback for local dev

// Set axios default base URL
axios.defaults.baseURL = API_BASE_URL;
// --- END FIX ---


export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  isApproved: boolean;
  houseNumber?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      // Now axios will prefix this with API_BASE_URL
      const response = await axios.get('/api/auth/me'); 
      const userData = response.data.user;
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isApproved: userData.isApproved,
        houseNumber: userData.houseNumber,
        profileImage: userData.profileImage
      });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Now axios will prefix this with API_BASE_URL
      const response = await axios.post('/api/auth/login', { email, password }); 
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login successful!');
    } catch (error: any) {
      // You can console log the error object here for more details
      console.error("Login error:", error); 
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      alert(error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Now axios will prefix this with API_BASE_URL
      const response = await axios.post('/api/auth/register', userData); 
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Registration successful!');
    } catch (error: any) {
      // You can console log the error object here for more details
      console.error("Registration error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};