import {
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import type { AuthenticatedUser } from "../../../auth/interfaces/authenticated-user.interface";

import { TicketEntity } from "../../entities/ticket.entity";

@Injectable()
export class TicketPolicyService {
  hasPermission(
    user: AuthenticatedUser,
    permission: string,
  ): boolean {
    return user.permissions.includes(permission);
  }

  assertHasPermission(
    user: AuthenticatedUser,
    permission: string,
  ): void {
    if (!this.hasPermission(user, permission)) {
      throw new ForbiddenException(
        `Missing required permission: ${permission}`,
      );
    }
  }

  assertHasAnyPermission(
    user: AuthenticatedUser,
    permissions: string[],
  ): void {
    const allowed = permissions.some((permission) =>
      this.hasPermission(user, permission),
    );

    if (!allowed) {
      throw new ForbiddenException(
        "You do not have permission to perform this operation.",
      );
    }
  }

  /**
   * Admin/Supervisor con tickets.read.all pueden ver todos.
   *
   * Un agente normal puede ver tickets:
   * - asignados a él
   * - creados por él
   */
  canReadTicket(
    user: AuthenticatedUser,
    ticket: TicketEntity,
  ): boolean {
    if (this.hasPermission(user, "tickets.read.all")) {
      return true;
    }

    if (!this.hasPermission(user, "tickets.read")) {
      return false;
    }

    return (
      ticket.assignedToUserId === user.id ||
      ticket.createdByUserId === user.id
    );
  }

  assertCanReadTicket(
    user: AuthenticatedUser,
    ticket: TicketEntity,
  ): void {
    if (!this.canReadTicket(user, ticket)) {
      throw new ForbiddenException(
        "You cannot access this ticket.",
      );
    }
  }

  /**
   * Admin puede actualizar cualquier ticket.
   *
   * Agente solo puede modificar tickets actualmente
   * asignados a él.
   */
  assertCanUpdateTicket(
    user: AuthenticatedUser,
    ticket: TicketEntity,
  ): void {
    if (this.hasPermission(user, "tickets.update.any")) {
      return;
    }

    if (
      this.hasPermission(user, "tickets.update.assigned") &&
      ticket.assignedToUserId === user.id
    ) {
      return;
    }

    throw new ForbiddenException(
      "You cannot update this ticket.",
    );
  }

  assertCanChangeStatus(
    user: AuthenticatedUser,
    ticket: TicketEntity,
  ): void {
    if (
      this.hasPermission(
        user,
        "tickets.status.change.any",
      )
    ) {
      return;
    }

    if (
      this.hasPermission(
        user,
        "tickets.status.change.assigned",
      ) &&
      ticket.assignedToUserId === user.id
    ) {
      return;
    }

    throw new ForbiddenException(
      "You cannot change the status of this ticket.",
    );
  }

  assertCanComment(
    user: AuthenticatedUser,
    ticket: TicketEntity,
    internal: boolean,
  ): void {
    this.assertCanReadTicket(user, ticket);

    if (internal) {
      this.assertHasPermission(
        user,
        "tickets.comment.internal",
      );

      return;
    }

    this.assertHasPermission(
      user,
      "tickets.comment",
    );
  }

  canViewInternalComments(
    user: AuthenticatedUser,
  ): boolean {
    return this.hasPermission(
      user,
      "tickets.comment.internal",
    );
  }

  assertCanViewOperationalAging(
    user: AuthenticatedUser,
  ): void {
    this.assertHasPermission(
      user,
      "tickets.overdue.read",
    );
  }

  assertCanDelete(
    user: AuthenticatedUser,
  ): void {
    this.assertHasPermission(
      user,
      "tickets.delete",
    );
  }
}