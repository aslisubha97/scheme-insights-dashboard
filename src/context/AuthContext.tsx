
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: 'admin' | 'pmksy';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  token: string | null; // Add the token property to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Add token state

  useEffect(() => {
    // Check if user is already logged in from session storage
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const userData = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token'); // Get token from session storage
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      setToken(storedToken); // Set token state
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Simple authentication - in a real app, this should connect to a backend
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = { username: 'admin', role: 'admin' };
      const generatedToken = `token_${Math.random().toString(36).substring(2)}`; // Generate a simple token
      setIsAuthenticated(true);
      setUser(adminUser);
      setToken(generatedToken); // Set the token
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify(adminUser));
      sessionStorage.setItem('token', generatedToken); // Store token in session storage
      return true;
    } else if (username === 'pmksy' && password === 'pmksy') {
      const pmksyUser: User = { username: 'pmksy', role: 'pmksy' };
      const generatedToken = `token_${Math.random().toString(36).substring(2)}`; // Generate a simple token
      setIsAuthenticated(true);
      setUser(pmksyUser);
      setToken(generatedToken); // Set the token
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify(pmksyUser));
      sessionStorage.setItem('token', generatedToken); // Store token in session storage
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null); // Clear token
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token'); // Remove token from session storage
  };
  
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isAdmin }}>
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
