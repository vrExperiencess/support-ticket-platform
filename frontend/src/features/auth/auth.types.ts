export interface AuthRole {
  id: string;
  code: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;

  role: AuthRole;

  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;

  user: AuthenticatedUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}