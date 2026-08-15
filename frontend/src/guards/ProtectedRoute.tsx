import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../features/auth/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;

  permission?: string;
}

export default function ProtectedRoute({
  children,
  permission,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
    isAuthenticated,
    hasPermission,
  } = useAuth();

  const location =
    useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-corporate-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />

          <span className="text-sm font-medium text-navy-500">
            Loading application...
          </span>
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (
    permission &&
    !hasPermission(permission)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}