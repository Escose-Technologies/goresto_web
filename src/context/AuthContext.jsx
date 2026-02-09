import { createContext, useContext, useState, useEffect } from 'react';
import { authService, clearTokens } from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session from refresh token
    const restoreSession = async () => {
      try {
        const restoredUser = await authService.restoreSession();
        if (restoredUser) {
          setUser(restoredUser);
        }
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    // Quick check: if no refresh token, skip API call
    const hasRefreshToken = localStorage.getItem('goresto_refreshToken');
    if (!hasRefreshToken) {
      setLoading(false);
      return;
    }

    restoreSession();
  }, []);

  const login = async (email, password, role) => {
    const userData = await authService.login(email, password, role);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'superadmin',
    isRestaurantAdmin: user?.role === 'restaurant_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
