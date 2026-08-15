import {
  apiRequest,
} from "./apiClient";

import type {
  ChangeTicketStatusPayload,
  CreateTicketPayload,
  PaginatedTicketsResponse,
  TicketCatalogItem,
  TicketComment,
  TicketDetail,
  TicketFilters,
  TicketLookupOption,
  TicketStatusHistory,
  TicketAssignmentHistory,
  UpdateTicketPayload,
} from "../features/tickets/ticket.types";

/**
 * Convierte nuestros filtros a query params.
 *
 * No enviamos parámetros vacíos para mantener URLs limpias.
 */
function buildTicketQuery(
  filters: TicketFilters,
): string {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(filters.page),
  );

  params.set(
    "limit",
    String(filters.limit),
  );

  params.set(
    "sortBy",
    filters.sortBy,
  );

  params.set(
    "sortOrder",
    filters.sortOrder,
  );

  if (filters.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters.priority) {
    params.set(
      "priority",
      filters.priority,
    );
  }

  if (filters.clientId) {
    params.set(
      "clientId",
      filters.clientId,
    );
  }

  if (
    filters.assignedToUserId
  ) {
    params.set(
      "assignedToUserId",
      filters.assignedToUserId,
    );
  }

  if (
    filters.search?.trim()
  ) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.overdue) {
    params.set(
      "overdue",
      "true",
    );
  }

  if (filters.stale) {
    params.set(
      "stale",
      "true",
    );
  }

  return params.toString();
}

export const ticketsService = {
  /*
   * LIST / DETAIL
   */

  getTickets(
    filters: TicketFilters,
  ) {
    const query =
      buildTicketQuery(
        filters,
      );

    return apiRequest<PaginatedTicketsResponse>(
      `/tickets?${query}`,
    );
  },

  getTicket(
    id: string,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}`,
    );
  },

  /*
   * CREATE / UPDATE
   */

  createTicket(
    payload: CreateTicketPayload,
  ) {
    return apiRequest<TicketDetail>(
      "/tickets",
      {
        method: "POST",

        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  updateTicket(
    id: string,
    payload: UpdateTicketPayload,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  /*
   * ASSIGNMENT
   */

  assignTicket(
    id: string,
    userId: string,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}/assign`,
      {
        method: "POST",

        body: JSON.stringify({
          userId,
        }),
      },
    );
  },

  reassignTicket(
    id: string,
    userId: string,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}/reassign`,
      {
        method: "POST",

        body: JSON.stringify({
          userId,
        }),
      },
    );
  },

  /*
   * STATUS
   */

  changeStatus(
    id: string,
    payload: ChangeTicketStatusPayload,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}/status`,
      {
        method: "PATCH",

        body: JSON.stringify(
          payload,
        ),
      },
    );
  },

  closeTicket(
    id: string,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}/close`,
      {
        method: "POST",
      },
    );
  },

  reopenTicket(
    id: string,
  ) {
    return apiRequest<TicketDetail>(
      `/tickets/${id}/reopen`,
      {
        method: "POST",
      },
    );
  },

  /*
   * SOFT DELETE
   */

  deleteTicket(
    id: string,
  ) {
    return apiRequest<void>(
      `/tickets/${id}`,
      {
        method: "DELETE",
      },
    );
  },

  /*
   * COMMENTS
   */

  getComments(
    ticketId: string,
  ) {
    return apiRequest<
      TicketComment[]
    >(
      `/tickets/${ticketId}/comments`,
    );
  },

  createComment(
    ticketId: string,
    content: string,
    isInternal = false,
  ) {
    return apiRequest<TicketComment>(
      `/tickets/${ticketId}/comments`,
      {
        method: "POST",

        body: JSON.stringify({
          content,
          isInternal,
        }),
      },
    );
  },

  /*
   * HISTORY
   */

  getAssignmentHistory(
    ticketId: string,
  ) {
    return apiRequest<
      TicketAssignmentHistory[]
    >(
      `/tickets/${ticketId}/assignment-history`,
    );
  },

  getStatusHistory(
    ticketId: string,
  ) {
    return apiRequest<
      TicketStatusHistory[]
    >(
      `/tickets/${ticketId}/status-history`,
    );
  },

  /*
   * CATALOGS
   */

  getStatuses() {
    return apiRequest<
      TicketCatalogItem[]
    >(
      "/tickets/catalogs/statuses",
    );
  },

  getPriorities() {
    return apiRequest<
      TicketCatalogItem[]
    >(
      "/tickets/catalogs/priorities",
    );
  },

  getClients() {
    return apiRequest<
      TicketLookupOption[]
    >(
      "/tickets/catalogs/clients",
    );
  },

  getAssignees() {
    return apiRequest<
      TicketLookupOption[]
    >(
      "/tickets/catalogs/assignees",
    );
  },
};