import { Transform, Type } from "class-transformer";

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

import {
  SortOrder,
  TicketPriorityCode,
  TicketSortBy,
  TicketStatusCode,
} from "../enums/ticket.enums";

function parseBoolean(value: unknown): unknown {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return value;
}

export class TicketFilterDto {
  @IsOptional()
  @IsEnum(TicketStatusCode)
  status?: TicketStatusCode;

  @IsOptional()
  @IsEnum(TicketPriorityCode)
  priority?: TicketPriorityCode;

  @IsOptional()
  @IsUUID("4")
  clientId?: string;

  @IsOptional()
  @IsUUID("4")
  assignedToUserId?: string;

  /**
   * Búsqueda por título, descripción o cliente.
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Ticket cuya fecha dueAt ya pasó.
   */
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  overdue?: boolean;

  /**
   * Ticket con más de 48h sin actividad.
   */
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  stale?: boolean;

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
  @IsEnum(TicketSortBy)
  sortBy: TicketSortBy = TicketSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}