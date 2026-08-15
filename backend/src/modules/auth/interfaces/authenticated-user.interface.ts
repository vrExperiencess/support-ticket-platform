export interface AuthenticatedRole {
  id: string;
  code: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;

  role: AuthenticatedRole;

  permissions: string[];
}