import {
  apiRequest,
} from "./apiClient";

import type {
  CreateUserPayload,
  PaginatedUsersResponse,
  RoleOption,
  UpdateUserPayload,
  UserDetail,
  UserFilters,
} from "../features/users/user.types";

function buildUserQuery(
  filters:
    UserFilters,
): string {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(
      filters.page,
    ),
  );

  params.set(
    "limit",
    String(
      filters.limit,
    ),
  );

  params.set(
    "sortBy",
    filters.sortBy,
  );

  params.set(
    "sortOrder",
    filters.sortOrder,
  );

  if (
    filters.search?.trim()
  ) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (
    filters.role
  ) {
    params.set(
      "role",
      filters.role,
    );
  }

  if (
    filters.isActive !==
    undefined
  ) {
    params.set(
      "isActive",
      String(
        filters.isActive,
      ),
    );
  }

  return params.toString();
}

export const usersService = {
  getUsers(
    filters:
      UserFilters,
  ) {
    return apiRequest<PaginatedUsersResponse>(
      `/users?${buildUserQuery(filters)}`,
    );
  },

  getUser(
    id: string,
  ) {
    return apiRequest<UserDetail>(
      `/users/${id}`,
    );
  },

  getRoles() {
    return apiRequest<RoleOption[]>(
      "/users/catalogs/roles",
    );
  },

  createUser(
    payload:
      CreateUserPayload,
  ) {
    return apiRequest<UserDetail>(
      "/users",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },

  updateUser(
    id: string,
    payload:
      UpdateUserPayload,
  ) {
    return apiRequest<UserDetail>(
      `/users/${id}`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );
  },
};