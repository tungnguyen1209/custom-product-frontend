"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthUser,
  changePassword as apiChangePassword,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  startOAuth,
  updateProfile as apiUpdateProfile,
} from "@/lib/auth";
import { getAuthToken, setAuthToken } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  refresh: () => Promise<void>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<AuthUser>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setTokenFromOAuth: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await getMe();
      setUser(profile);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const res = await apiRegister(payload);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(() => startOAuth("google"), []);
  const loginWithFacebook = useCallback(() => startOAuth("facebook"), []);

  const setTokenFromOAuth = useCallback(
    async (token: string) => {
      setAuthToken(token);
      await refresh();
    },
    [refresh],
  );

  const updateProfile = useCallback(
    async (payload: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
    }) => {
      const updated = await apiUpdateProfile(payload);
      setUser(updated);
      return updated;
    },
    [],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await apiChangePassword({ currentPassword, newPassword });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        refresh,
        updateProfile,
        changePassword,
        setTokenFromOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
