import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fa_token');
      const savedUser = localStorage.getItem('fa_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          // Validate token against backend
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('fa_user', JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem('fa_token');
          localStorage.removeItem('fa_user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('fa_token', token);
    localStorage.setItem('fa_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, occupation) => {
    const res = await authAPI.register({ name, email, password, occupation });
    const { token, user: userData } = res.data;
    localStorage.setItem('fa_token', token);
    localStorage.setItem('fa_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fa_token');
    localStorage.removeItem('fa_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('fa_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
