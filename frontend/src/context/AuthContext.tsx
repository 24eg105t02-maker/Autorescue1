import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { AuthResponse, UserSummary } from '../types';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  loading: boolean;
  sessionExpiredMsg: string | null;
  setSessionData: (auth: AuthResponse) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpiredMsg: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const saved = sessionStorage.getItem('autorescue_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('autorescue_jwt'));
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);

  const setSessionData = useCallback((auth: AuthResponse) => {
    sessionStorage.setItem('autorescue_jwt', auth.token);
    sessionStorage.setItem('autorescue_user', JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
    setSessionExpiredMsg(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = sessionStorage.getItem('autorescue_jwt');
    if (!currentToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<UserSummary>('/auth/me');
      setUser(res.data);
      sessionStorage.setItem('autorescue_user', JSON.stringify(res.data));
    } catch {
      sessionStorage.removeItem('autorescue_jwt');
      sessionStorage.removeItem('autorescue_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (sessionStorage.getItem('autorescue_jwt')) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore logout network error
    } finally {
      sessionStorage.removeItem('autorescue_jwt');
      sessionStorage.removeItem('autorescue_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUser(null);
      setSessionExpiredMsg('Your session has expired. Please sign in again to continue.');
    };
    window.addEventListener('autorescue:session-expired', handleExpired);
    return () => window.removeEventListener('autorescue:session-expired', handleExpired);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionExpiredMsg,
        setSessionData,
        refreshUser,
        logout,
        clearSessionExpiredMsg: () => setSessionExpiredMsg(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
