import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('freshfind_user');
    const storedToken = localStorage.getItem('freshfind_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else {
        localStorage.removeItem('freshfind_user');
        localStorage.removeItem('freshfind_token');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('freshfind_user', JSON.stringify(userData));
    localStorage.setItem('freshfind_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshfind_user');
    localStorage.removeItem('freshfind_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
