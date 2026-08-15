import {
  apiRequest,
} from "./apiClient";

import type {
  AuthenticatedUser,
  LoginCredentials,
  LoginResponse,
} from "../features/auth/auth.types";

export const authService = {
  login(
    credentials: LoginCredentials,
  ) {
    return apiRequest<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(
          credentials,
        ),
      },
    );
  },

  me() {
    return apiRequest<AuthenticatedUser>(
      "/auth/me",
    );
  },
};