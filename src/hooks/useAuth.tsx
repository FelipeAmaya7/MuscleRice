import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp, apiLogout } from '../services/authService';

const AUTH_STORAGE_KEY = 'mr-auth';

// ─────────────────────────────────────────────────────────────────────────────
// Context Type
// ─────────────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // ── Send OTP to email ──
  const sendOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiSendOtp(email);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el código');
      throw err; // Re-throw so LoginPage can stay on step 1
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP code ──
  const verifyOtp = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const verifiedUser = await apiVerifyOtp(email, code);
      setUser(verifiedUser);
    } catch (err: any) {
      setError(err.message || 'Código incorrecto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, error, sendOtp, verifyOtp, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
