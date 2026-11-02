import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  register: (payload: any) => Promise<void>;
  setAuthUser: (user: any, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('resisync_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('resisync_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      api.setToken(savedToken);
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setTokenState(savedToken);
        getSocket(savedToken);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, password);
      if (res.success && res.token && res.user) {
        api.setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        getSocket(res.token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (targetRole: UserRole) => {
    let email = 'resident@resisync.com';
    if (targetRole === 'SECURITY') email = 'guard@resisync.com';
    if (targetRole === 'ADMIN') email = 'admin@resisync.com';
    await login(email, 'password123');
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      if (res.success && res.token && res.user) {
        api.setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        getSocket(res.token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthUser = (newUser: any, newToken: string) => {
    api.setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    getSocket(newToken);
  };

  const logout = () => {
    api.setToken(null);
    setTokenState(null);
    setUser(null);
    disconnectSocket();
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        register,
        setAuthUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

