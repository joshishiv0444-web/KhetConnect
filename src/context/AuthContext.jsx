import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../config';

const AuthContext = createContext();


// Helper: save session to localStorage
const persistSession = (user, profile, token) => {
  localStorage.setItem('kc_session', JSON.stringify({ user, profile, token }));
};

const clearSession = () => localStorage.removeItem('kc_session');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore session on page reload
  useEffect(() => {
    const raw = localStorage.getItem('kc_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.user && parsed.token) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          setToken(parsed.token);
          setIsAuthenticated(true);
        }
      } catch (_) { clearSession(); }
    }
  }, []);

  // ── LOGIN ──────────────────────────────────────────────
  // role = 'buyer' | 'farmer'
  const login = async (name, password, role) => {
    setIsLoading(true);
    try {
      const endpoint = role === 'farmer'
        ? `${API}/login/producer`
        : `${API}/login/buyer`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const dbUser    = { id: data.user.id, name: data.user.name };
      const dbProfile = {
        name:       data.user.name,
        role:       data.user.role,
        number:     data.user.number,
        age:        data.user.age,
        address:    data.user.address,
        occupation: data.user.occupation || null,
        aad:        data.user.aad || null,
      };

      setUser(dbUser);
      setProfile(dbProfile);
      setToken(data.token);
      setIsAuthenticated(true);
      persistSession(dbUser, dbProfile, data.token);

      return { user: dbUser, profile: dbProfile };
    } finally {
      setIsLoading(false);
    }
  };

  // ── SIGNUP ─────────────────────────────────────────────
  const signup = async (userData) => {
    setIsLoading(true);
    try {
      // farmer → sign2, buyer → sign1
      const endpoint = userData.role === 'farmer'
        ? `${API}/sign2`
        : `${API}/sign1`;

      // Build payload matching exactly what the backend models expect
      const payload = userData.role === 'farmer'
        ? {
            name:     userData.name,
            number:   Number(userData.phone),
            age:      Number(userData.age),
            dob:      userData.dob,
            address:  userData.location,
            aad:      Number(userData.aadhar),
            password: userData.password,
          }
        : {
            name:       userData.name,
            number:     Number(userData.phone),
            age:        Number(userData.age),
            dob:        userData.dob,
            address:    userData.location,
            password:   userData.password,
            occupation: userData.occupation || 'Buyer',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const dbUser    = { id: data.user.id, name: data.user.name };
      const dbProfile = {
        name:       data.user.name,
        role:       data.user.role,
        number:     data.user.number,
        age:        data.user.age,
        address:    data.user.address,
        occupation: data.user.occupation || null,
        aad:        data.user.aad || null,
      };

      setUser(dbUser);
      setProfile(dbProfile);
      setToken(data.token);
      setIsAuthenticated(true);
      persistSession(dbUser, dbProfile, data.token);

      return { user: dbUser, profile: dbProfile };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    setIsAuthenticated(false);
    clearSession();
  };

  // Expose token for any future authenticated API calls
  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{
      user, profile, token, isAuthenticated, isLoading,
      login, signup, logout, authHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
