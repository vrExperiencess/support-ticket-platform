import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  authService,
} from "../../services/auth.service";

import type {
  AuthenticatedUser,
  LoginCredentials,
} from "./auth.types";

interface AuthContextValue {
  user: AuthenticatedUser | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    credentials: LoginCredentials,
  ) => Promise<void>;

  logout: () => void;

  refreshUser: () => Promise<void>;

  hasPermission: (
    permission: string,
  ) => boolean;
}

export const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<AuthenticatedUser | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(
      "support_access_token",
    );

    setUser(null);
  }, []);

  const refreshUser =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "support_access_token",
        );

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const currentUser =
          await authService.me();

        setUser(currentUser);
      } catch {
        logout();
      }
    }, [logout]);

  useEffect(() => {
    async function initializeAuth() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    void initializeAuth();
  }, [refreshUser]);

  async function login(
    credentials: LoginCredentials,
  ) {
    const response =
      await authService.login(
        credentials,
      );

    localStorage.setItem(
      "support_access_token",
      response.accessToken,
    );

    setUser(response.user);
  }

  const hasPermission =
    useCallback(
      (permission: string) => {
        return (
          user?.permissions.includes(
            permission,
          ) ?? false
        );
      },
      [user],
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        isAuthenticated: !!user,
        isLoading,

        login,
        logout,
        refreshUser,

        hasPermission,
      }),
      [
        user,
        isLoading,
        logout,
        refreshUser,
        hasPermission,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}