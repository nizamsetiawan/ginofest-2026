"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { KcalUser, AuthState } from "@/types/auth";
import {
  getSessionUser,
  saveSessionUser,
  clearSessionUser,
  loginWithEmail,
  updateUserPin,
} from "@/services/auth-service";

interface AuthContextType extends AuthState {
  login: (email: string, secret: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (targetUser: KcalUser) => void;
  updatePin: (newPin: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  isSetupPinOpen: boolean;
  setIsSetupPinOpen: (open: boolean) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<KcalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupPinOpen, setIsSetupPinOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedUser = getSessionUser();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (e) {
      console.warn("Failed to load session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, secret: string) => {
    setIsLoading(true);
    const res = await loginWithEmail(email, secret);
    setIsLoading(false);

    if (res.success && res.user) {
      setUser(res.user);
      // If user has not configured their custom PIN yet, prompt PIN setup
      if (!res.user.isPinConfigured) {
        setIsSetupPinOpen(true);
      }
      return { success: true };
    }
    return { success: false, error: res.error || "Login gagal" };
  };

  const logout = useCallback(() => {
    clearSessionUser();
    setUser(null);
    setIsSetupPinOpen(false);
  }, []);

  const switchUser = useCallback((targetUser: KcalUser) => {
    setUser(targetUser);
    saveSessionUser(targetUser);
  }, []);

  const handleUpdatePin = async (newPin: string, newPassword?: string) => {
    if (!user) return { success: false, error: "Tidak ada user aktif" };
    const res = await updateUserPin(user.id, newPin, newPassword);
    if (res.success) {
      const updated: KcalUser = {
        ...user,
        pin: newPin,
        isPinConfigured: true,
        ...(newPassword ? { password: newPassword } : {}),
      };
      setUser(updated);
      saveSessionUser(updated);
      setIsSetupPinOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const refreshUser = () => {
    const saved = getSessionUser();
    if (saved) setUser(saved);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchUser,
        updatePin: handleUpdatePin,
        isSetupPinOpen,
        setIsSetupPinOpen,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
