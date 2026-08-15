export interface UserRole {
  id: string;

  code: string;

  name: string;
}

export interface UserListItem {
  id: string;

  name: string;

  email: string;

  isActive: boolean;

  role:
    UserRole;

  createdAt: string;

  updatedAt: string;
}

export interface UserOperationalStats {
  activeAssignedTickets:
    number;

  resolvedLast30Days:
    number;

  overdueAssignedTickets:
    number;

  createdTickets:
    number;
}

export interface UserDetail
  extends UserListItem {
  stats:
    UserOperationalStats;
}

export interface RoleOption {
  id: string;

  code: string;

  name: string;
}

export interface PaginationMeta {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

export interface PaginatedUsersResponse {
  data:
    UserListItem[];

  meta:
    PaginationMeta;
}

export type UserSortBy =
  | "name"
  | "email"
  | "createdAt"
  | "updatedAt";

export type UserSortOrder =
  | "ASC"
  | "DESC";

export interface UserFilters {
  search?: string;

  role?: string;

  isActive?: boolean;

  page: number;

  limit: number;

  sortBy:
    UserSortBy;

  sortOrder:
    UserSortOrder;
}

export interface CreateUserPayload {
  name: string;

  email: string;

  password: string;

  roleId: string;

  isActive: boolean;
}

export interface UpdateUserPayload {
  name?: string;

  email?: string;

  roleId?: string;

  isActive?: boolean;
}

export interface UserFormPayload {
  name: string;

  email: string;

  password?: string;

  roleId: string;

  isActive: boolean;
}