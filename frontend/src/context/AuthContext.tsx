'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sit_ticket_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    const res = await apiFetch<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      // Token expired or invalid
      logout();
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    const res = await apiFetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('sit_ticket_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }

    return { success: false, error: res.error || 'Login failed' };
  }

  async function register(data: any) {
    const res = await apiFetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      localStorage.setItem('sit_ticket_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }

    return { success: false, error: res.error || 'Registration failed' };
  }

  function logout() {
    localStorage.removeItem('sit_ticket_token');
    setToken(null);
    setUser(null);
  }

  async function switchDemoRole(role: UserRole) {
    const demoAccounts: Record<UserRole, string> = {
      STUDENT: 'student@sit.ac.in',
      ORGANIZER: 'organizer@sit.ac.in',
      ADMIN: 'admin@sit.ac.in',
      GATE_STAFF: 'gate@sit.ac.in',
    };

    const email = demoAccounts[role];
    await login(email, 'Password123!');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
