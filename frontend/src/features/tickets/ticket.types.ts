export type TicketStatusCode =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriorityCode =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TicketSortBy =
  | "createdAt"
  | "updatedAt"
  | "dueAt"
  | "priority";

export type SortOrder =
  | "ASC"
  | "DESC";

export interface TicketCatalogItem {
  id: string;
  code: string;
  name: string;
}

export interface TicketUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface TicketClientSummary {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
}

export interface TicketListItem {
  id: string;
  title: string;
  status: TicketCatalogItem;
  priority: TicketCatalogItem;
  client: TicketClientSummary;
  assignedTo:
    | TicketUserSummary
    | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isStale: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTicketsResponse {
  data: TicketListItem[];
  meta: PaginationMeta;
}

export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user: TicketUserSummary;
}

export interface TicketAssignmentHistory {
  id: string;
  eventType: string;
  fromUser:
    | TicketUserSummary
    | null;
  toUser: TicketUserSummary;
  assignedBy: TicketUserSummary;
  createdAt: string;
}

export interface TicketStatusHistory {
  id: string;
  fromStatus:
    | TicketCatalogItem
    | null;
  toStatus: TicketCatalogItem;
  changedBy: TicketUserSummary;
  createdAt: string;
}

export interface TicketDetail
  extends TicketListItem {
  description: string;
  createdBy: TicketUserSummary;
  resolvedBy:
    | TicketUserSummary
    | null;
  resolvedAt: string | null;
  closedAt: string | null;
  comments: TicketComment[];
  assignmentHistory:
    TicketAssignmentHistory[];
  statusHistory:
    TicketStatusHistory[];
}

export interface TicketLookupOption {
  id: string;
  name: string;
}

/*
 * Payloads enviados al backend.
 */

export interface CreateTicketPayload {
  clientId: string;
  title: string;
  description: string;
  priorityId: string;
  dueAt?: string;
}

export interface UpdateTicketPayload {
  clientId?: string;
  title?: string;
  description?: string;
  priorityId?: string;
  dueAt?: string;
}

export interface ChangeTicketStatusPayload {
  status: TicketStatusCode;
}

export interface TicketFilters {
  status?: TicketStatusCode;
  priority?: TicketPriorityCode;
  clientId?: string;
  assignedToUserId?: string;
  search?: string;
  overdue?: boolean;
  stale?: boolean;
  page: number;
  limit: number;
  sortBy: TicketSortBy;
  sortOrder: SortOrder;
}