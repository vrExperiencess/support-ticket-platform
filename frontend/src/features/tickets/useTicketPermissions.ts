import {
  useAuth,
} from "../auth/useAuth";

import type {
  TicketDetail,
} from "./ticket.types";

export function useTicketPermissions(
  ticket?: TicketDetail | null,
) {
  const {
    user,
    hasPermission,
  } =
    useAuth();

  const isAssignedToCurrentUser =
    !!ticket?.assignedTo &&
    ticket.assignedTo.id ===
      user?.id;

  /*
   * Creación
   */
  const canCreate =
    hasPermission(
      "tickets.create",
    );

  /*
   * Edición
   */
  const canEditAny =
    hasPermission(
      "tickets.update.any",
    );

  const canEditAssigned =
    hasPermission(
      "tickets.update.assigned",
    ) &&
    isAssignedToCurrentUser;

  const canEdit =
    canEditAny ||
    canEditAssigned;

  /*
   * Assignment
   */
  const canAssign =
    hasPermission(
      "tickets.assign",
    ) &&
    !ticket?.assignedTo;

  const canReassign =
    hasPermission(
      "tickets.reassign",
    ) &&
    !!ticket?.assignedTo;

  /*
   * Status
   */
  const canChangeAnyStatus =
    hasPermission(
      "tickets.status.change.any",
    );

  const canChangeAssignedStatus =
    hasPermission(
      "tickets.status.change.assigned",
    ) &&
    isAssignedToCurrentUser;

  const canChangeStatus =
    canChangeAnyStatus ||
    canChangeAssignedStatus;

  /*
   * Closing
   */
  const canClose =
    hasPermission(
      "tickets.close",
    ) &&
    ticket?.status.code !==
      "CLOSED";

  const canReopen =
    hasPermission(
      "tickets.reopen",
    ) &&
    ticket?.status.code ===
      "CLOSED";

  /*
   * Comments
   */
  const canComment =
    hasPermission(
      "tickets.comment",
    );

  const canInternalComment =
    hasPermission(
      "tickets.comment.internal",
    );

  /*
   * Delete
   */
  const canDelete =
    hasPermission(
      "tickets.delete",
    );

  /*
   * Operational filters
   */
  const canViewAging =
    hasPermission(
      "tickets.overdue.read",
    );

  return {
    canCreate,

    canEdit,
    canEditAny,
    canEditAssigned,

    canAssign,
    canReassign,

    canChangeStatus,

    canClose,
    canReopen,

    canComment,
    canInternalComment,

    canDelete,

    canViewAging,

    isAssignedToCurrentUser,
  };
}