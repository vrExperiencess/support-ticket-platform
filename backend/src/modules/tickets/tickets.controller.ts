import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

import { AssignTicketDto } from "./dto/assign-ticket.dto";
import { ChangeTicketStatusDto } from "./dto/change-ticket-status.dto";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ReassignTicketDto } from "./dto/reassign-ticket.dto";
import { TicketFilterDto } from "./dto/ticket-filter.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";

import {
  PaginatedTicketsResponseDto,
  TicketAssignmentHistoryResponseDto,
  TicketCatalogItemDto,
  TicketDetailResponseDto,
  TicketLookupOptionDto,
  TicketStatusHistoryResponseDto,
} from "./dto/ticket-response.dto";

import { TicketsService } from "./tickets.service";

@Controller("tickets")
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  /*
   * ============================================================
   * CATALOGS
   * ============================================================
   */

  @Get("catalogs/statuses")
  @Permissions("tickets.read")
  getStatuses(): Promise<
    TicketCatalogItemDto[]
  > {
    return this.ticketsService.getStatuses();
  }

  @Get("catalogs/priorities")
  @Permissions("tickets.read")
  getPriorities(): Promise<
    TicketCatalogItemDto[]
  > {
    return this.ticketsService.getPriorities();
  }

  @Get("catalogs/clients")
  @Permissions("tickets.create")
  getClients(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketLookupOptionDto[]> {
    return this.ticketsService.getClientOptions(
      user,
    );
  }

  @Get("catalogs/assignees")
  getAssignableAgents(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketLookupOptionDto[]> {
    return this.ticketsService.getAssignableAgents(
      user,
    );
  }

  /*
   * ============================================================
   * LIST
   * ============================================================
   */

  @Get()
  @Permissions("tickets.read")
  findAll(
    @Query()
    filters: TicketFilterDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<PaginatedTicketsResponseDto> {
    return this.ticketsService.findAll(
      filters,
      user,
    );
  }

  /*
   * ============================================================
   * CREATE
   * ============================================================
   */

  @Post()
  @Permissions("tickets.create")
  create(
    @Body()
    dto: CreateTicketDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.create(
      dto,
      user,
    );
  }

  /*
   * ============================================================
   * HISTORY
   * ============================================================
   */

  @Get(":id/assignment-history")
  @Permissions("tickets.read")
  getAssignmentHistory(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<
    TicketAssignmentHistoryResponseDto[]
  > {
    return this.ticketsService.getAssignmentHistory(
      id,
      user,
    );
  }

  @Get(":id/status-history")
  @Permissions("tickets.read")
  getStatusHistory(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<
    TicketStatusHistoryResponseDto[]
  > {
    return this.ticketsService.getStatusHistory(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * DETAIL
   * ============================================================
   */

  @Get(":id")
  @Permissions("tickets.read")
  findOne(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * UPDATE
   *
   * No usamos @Permissions aquí porque existen dos escenarios:
   *
   * tickets.update.any
   * tickets.update.assigned
   *
   * TicketPolicyService resuelve cuál aplica.
   * ============================================================
   */

  @Patch(":id")
  update(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @Body()
    dto: UpdateTicketDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.update(
      id,
      dto,
      user,
    );
  }

  /*
   * ============================================================
   * ASSIGN
   * ============================================================
   */

  @Post(":id/assign")
  @Permissions("tickets.assign")
  assign(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @Body()
    dto: AssignTicketDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.assign(
      id,
      dto,
      user,
    );
  }

  /*
   * ============================================================
   * REASSIGN
   * ============================================================
   */

  @Post(":id/reassign")
  @Permissions("tickets.reassign")
  reassign(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @Body()
    dto: ReassignTicketDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.reassign(
      id,
      dto,
      user,
    );
  }

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  @Patch(":id/status")
  changeStatus(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @Body()
    dto: ChangeTicketStatusDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.changeStatus(
      id,
      dto,
      user,
    );
  }

  /*
   * ============================================================
   * CLOSE
   * ============================================================
   */

  @Post(":id/close")
  @Permissions("tickets.close")
  close(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.close(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * REOPEN
   * ============================================================
   */

  @Post(":id/reopen")
  @Permissions("tickets.reopen")
  reopen(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.reopen(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * DELETE
   *
   * Es un soft delete.
   * ============================================================
   */

  @Delete(":id")
  @Permissions("tickets.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
      }),
    )
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.ticketsService.remove(
      id,
      user,
    );
  }
}