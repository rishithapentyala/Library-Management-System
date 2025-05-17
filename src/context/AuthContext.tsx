import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | null;
  userData: any;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (adminId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('library_token');
    const role = localStorage.getItem('library_role');
    const user = localStorage.getItem('library_user');

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role as 'user' | 'admin');
      setUserData(user ? JSON.parse(user) : null);
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('library_token', response.data.token);
        localStorage.setItem('library_role', 'user');
        localStorage.setItem('library_user', JSON.stringify(response.data.user));
        
        setIsAuthenticated(true);
        setUserRole('user');
        setUserData(response.data.user);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (adminId: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/admin-login', {
        adminId,
        password
      });

      if (response.data.token) {
        localStorage.setItem('library_token', response.data.token);
        localStorage.setItem('library_role', 'admin');
        localStorage.setItem('library_user', JSON.stringify(response.data.admin));
        
        setIsAuthenticated(true);
        setUserRole('admin');
        setUserData(response.data.admin);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_role');
    localStorage.removeItem('library_user');
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userData, 
      login, 
      adminLogin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};