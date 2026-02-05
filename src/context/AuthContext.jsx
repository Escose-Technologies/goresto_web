import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/dataService';

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
    // Check for stored session
    const storedUser = localStorage.getItem('goresto_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('goresto_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const users = await userService.getAll();
      const foundUser = users.find(
        u => u.email === email && 
        u.password === password && 
        (role === 'superadmin' ? u.role === 'superadmin' : u.role === 'restaurant_admin')
      );

      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      const userData = { ...foundUser };
      delete userData.password; // Don't store password in state
      
      setUser(userData);
      localStorage.setItem('goresto_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goresto_user');
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


