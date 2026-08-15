import { TicketCommentResponseDto } from "../../comments/dto/comment-response.dto";

export class TicketUserSummaryDto {
  id!: string;
  name!: string;
  email!: string;
}

export class TicketClientSummaryDto {
  id!: string;
  name!: string;
  email!: string;
  companyName!: string | null;
}

export class TicketCatalogItemDto {
  id!: string;
  code!: string;
  name!: string;
}

export class TicketListItemDto {
  id!: string;

  title!: string;

  status!: TicketCatalogItemDto;

  priority!: TicketCatalogItemDto;

  client!: TicketClientSummaryDto;

  assignedTo!: TicketUserSummaryDto | null;

  dueAt!: Date | null;

  createdAt!: Date;

  updatedAt!: Date;

  isOverdue!: boolean;

  isStale!: boolean;
}

export class PaginationMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class PaginatedTicketsResponseDto {
  data!: TicketListItemDto[];

  meta!: PaginationMetaDto;
}

export class TicketAssignmentHistoryResponseDto {
  id!: string;

  eventType!: string;

  fromUser!: TicketUserSummaryDto | null;

  toUser!: TicketUserSummaryDto;

  assignedBy!: TicketUserSummaryDto;

  createdAt!: Date;
}

export class TicketStatusHistoryResponseDto {
  id!: string;

  fromStatus!: TicketCatalogItemDto | null;

  toStatus!: TicketCatalogItemDto;

  changedBy!: TicketUserSummaryDto;

  createdAt!: Date;
}

export class TicketDetailResponseDto extends TicketListItemDto {
  description!: string;

  createdBy!: TicketUserSummaryDto;

  resolvedBy!: TicketUserSummaryDto | null;

  resolvedAt!: Date | null;

  closedAt!: Date | null;

  comments!: TicketCommentResponseDto[];

  assignmentHistory!: TicketAssignmentHistoryResponseDto[];

  statusHistory!: TicketStatusHistoryResponseDto[];
}

export class TicketLookupOptionDto {
  id!: string;
  name!: string;
}