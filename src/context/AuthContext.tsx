import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Usuario } from '../types';
import { authService } from '../services/authService';

const AuthContextus = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUsuario(response.user);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nombre: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(nombre, email, password);
      setUsuario(response.user);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
  };

  const updateUsuario = (patch: Partial<Usuario>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('user_data', JSON.stringify(updated));
      return updated;
    });
  };

  const value: AuthContextType = {
    usuario,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUsuario,
  };

  return (
    <AuthContextus.Provider value={value}>
      {children}
    </AuthContextus.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContextus);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
