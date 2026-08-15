export class UserRoleResponseDto {
  id!: string;

  code!: string;

  name!: string;
}

export class UserListItemResponseDto {
  id!: string;

  name!: string;

  email!: string;

  isActive!: boolean;

  role!: UserRoleResponseDto;

  createdAt!: Date;

  updatedAt!: Date;
}

export class PaginationMetaDto {
  page!: number;

  limit!: number;

  total!: number;

  totalPages!: number;
}

export class PaginatedUsersResponseDto {
  data!: UserListItemResponseDto[];

  meta!: PaginationMetaDto;
}

export class UserOperationalStatsDto {
  /**
   * Tickets actualmente OPEN/IN_PROGRESS
   * asignados al usuario.
   */
  activeAssignedTickets!: number;

  /**
   * Tickets resueltos por este usuario en
   * una ventana móvil de 30 días.
   */
  resolvedLast30Days!: number;

  /**
   * Tickets vencidos actualmente asignados.
   */
  overdueAssignedTickets!: number;

  /**
   * Tickets creados históricamente por el usuario.
   */
  createdTickets!: number;
}

export class UserDetailResponseDto
  extends UserListItemResponseDto {
  stats!: UserOperationalStatsDto;
}

export class RoleOptionResponseDto {
  id!: string;

  code!: string;

  name!: string;
}