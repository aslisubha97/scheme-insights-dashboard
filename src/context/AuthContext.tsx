
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in from session storage
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const userData = sessionStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Simple authentication - in a real app, this should connect to a backend
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = { username: 'admin', role: 'admin' };
      setIsAuthenticated(true);
      setUser(adminUser);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify(adminUser));
      return true;
    } else if (username === 'pmksy' && password === 'pmksy') {
      const pmksyUser: User = { username: 'pmksy', role: 'pmksy' };
      setIsAuthenticated(true);
      setUser(pmksyUser);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify(pmksyUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
  };
  
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isAdmin }}>
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
