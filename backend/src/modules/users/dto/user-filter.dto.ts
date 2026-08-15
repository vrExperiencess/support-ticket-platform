import {
  Transform,
  Type,
} from "class-transformer";

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export enum UserSortBy {
  NAME = "name",
  EMAIL = "email",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export enum UserSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

function parseBoolean(
  value: unknown,
): unknown {
  if (
    value === true ||
    value === "true"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false"
  ) {
    return false;
  }

  return value;
}

export class UserFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filtramos por código:
   *
   * ADMIN
   * SUPERVISOR
   * SUPPORT_AGENT
   */
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    parseBoolean(value),
  )
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy:
    UserSortBy =
    UserSortBy.NAME;

  @IsOptional()
  @IsEnum(UserSortOrder)
  sortOrder:
    UserSortOrder =
    UserSortOrder.ASC;
}