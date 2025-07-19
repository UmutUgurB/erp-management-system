'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use notification context with fallback
  const getNotification = () => {
    try {
      return useNotification();
    } catch {
      // Fallback for when NotificationProvider is not available
      return {
        success: (msg: string) => console.log('Success:', msg),
        error: (msg: string) => console.error('Error:', msg),
        info: (msg: string) => console.info('Info:', msg),
      };
    }
  };

  const notification = getNotification();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      notification.success('Giriş başarılı!', {
        title: 'Hoş Geldiniz',
        duration: 3000
      });
      return true;
    } catch (error: any) {
      notification.error(
        error.response?.data?.message || 'Giriş başarısız', 
        {
          title: 'Giriş Hatası',
          duration: 5000
        }
      );
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    notification.info('Güvenli bir şekilde çıkış yaptınız', {
      title: 'Çıkış Yapıldı',
      duration: 3000
    });
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 