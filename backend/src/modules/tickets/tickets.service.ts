import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import {
  Brackets,
  DataSource,
  Repository,
} from "typeorm";

import type { AuthenticatedUser } from "../auth/interfaces/authenticated-user.interface";

import { ClientsService } from "../clients/clients.service";
import { ClientEntity } from "../clients/entities/client.entity";
import { UsersService } from "../users/users.service";

import { TicketCommentEntity } from "../comments/entities/ticket-comment.entity";

import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { TicketFilterDto } from "./dto/ticket-filter.dto";
import { AssignTicketDto } from "./dto/assign-ticket.dto";
import { ReassignTicketDto } from "./dto/reassign-ticket.dto";
import { ChangeTicketStatusDto } from "./dto/change-ticket-status.dto";

import {
  PaginatedTicketsResponseDto,
  TicketAssignmentHistoryResponseDto,
  TicketCatalogItemDto,
  TicketDetailResponseDto,
  TicketListItemDto,
  TicketLookupOptionDto,
  TicketStatusHistoryResponseDto,
  TicketUserSummaryDto,
} from "./dto/ticket-response.dto";

import { TicketEntity } from "./entities/ticket.entity";
import { TicketStatusEntity } from "./entities/ticket-status.entity";
import { TicketPriorityEntity } from "./entities/ticket-priority.entity";

import {
  TicketAssignmentEventType,
  TicketAssignmentHistoryEntity,
} from "./entities/ticket-assignment-history.entity";

import { TicketStatusHistoryEntity } from "./entities/ticket-status-history.entity";

import {
  SortOrder,
  TicketSortBy,
  TicketStatusCode,
} from "./enums/ticket.enums";

import { TicketPolicyService } from "./policies/ticket-policy/ticket-policy.service";

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,

    @InjectRepository(TicketStatusEntity)
    private readonly statusRepository: Repository<TicketStatusEntity>,

    @InjectRepository(TicketPriorityEntity)
    private readonly priorityRepository: Repository<TicketPriorityEntity>,

    @InjectRepository(TicketAssignmentHistoryEntity)
    private readonly assignmentHistoryRepository: Repository<TicketAssignmentHistoryEntity>,

    @InjectRepository(TicketStatusHistoryEntity)
    private readonly statusHistoryRepository: Repository<TicketStatusHistoryEntity>,

    @InjectRepository(TicketCommentEntity)
    private readonly commentRepository: Repository<TicketCommentEntity>,

    private readonly dataSource: DataSource,

    private readonly usersService: UsersService,

    private readonly clientsService: ClientsService,

    private readonly ticketPolicy: TicketPolicyService,
  ) {}

  /*
   * ============================================================
   * CATALOGS
   * ============================================================
   */

  async getStatuses(): Promise<TicketCatalogItemDto[]> {
    const statuses = await this.statusRepository.find({
      order: {
        sortOrder: "ASC",
      },
    });

    return statuses.map((status) => ({
      id: status.id,
      code: status.code,
      name: status.name,
    }));
  }

  async getPriorities(): Promise<TicketCatalogItemDto[]> {
    const priorities = await this.priorityRepository.find({
      order: {
        weight: "ASC",
      },
    });

    return priorities.map((priority) => ({
      id: priority.id,
      code: priority.code,
      name: priority.name,
    }));
  }

  /**
   * Clientes mínimos necesarios para el formulario de creación.
   *
   * No devuelve información completa de CRM.
   */
  async getClientOptions(
    user: AuthenticatedUser,
  ): Promise<TicketLookupOptionDto[]> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.create",
    );

    const clients =
      await this.clientsService.findActiveClients();

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
    }));
  }

  /**
   * Usuarios válidos para asignación/reasignación.
   */
  async getAssignableAgents(
    user: AuthenticatedUser,
  ): Promise<TicketLookupOptionDto[]> {
    this.ticketPolicy.assertHasAnyPermission(user, [
      "tickets.assign",
      "tickets.reassign",
    ]);

    const agents =
      await this.usersService.findActiveSupportAgents();

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
    }));
  }

  /*
   * ============================================================
   * LIST
   * ============================================================
   */

  async findAll(
    filters: TicketFilterDto,
    user: AuthenticatedUser,
  ): Promise<PaginatedTicketsResponseDto> {
    /**
     * Los filtros overdue y stale contienen información
     * operacional adicional, reservada a supervisor/admin.
     */
    if (filters.overdue || filters.stale) {
      this.ticketPolicy.assertCanViewOperationalAging(user);
    }

    const query =
      this.ticketRepository
        .createQueryBuilder("ticket")

        .leftJoinAndSelect(
          "ticket.client",
          "client",
        )

        .leftJoinAndSelect(
          "ticket.status",
          "status",
        )

        .leftJoinAndSelect(
          "ticket.priority",
          "priority",
        )

        .leftJoinAndSelect(
          "ticket.assignedToUser",
          "assignedTo",
        );

    /**
     * Admin/Supervisor:
     *   tickets.read.all -> todos.
     *
     * Agent:
     *   tickets asignados o creados por él.
     */
    if (
      !user.permissions.includes(
        "tickets.read.all",
      )
    ) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            "ticket.assignedToUserId = :userId",
            {
              userId: user.id,
            },
          ).orWhere(
            "ticket.createdByUserId = :userId",
            {
              userId: user.id,
            },
          );
        }),
      );
    }

    if (filters.status) {
      query.andWhere(
        "status.code = :status",
        {
          status: filters.status,
        },
      );
    }

    if (filters.priority) {
      query.andWhere(
        "priority.code = :priority",
        {
          priority: filters.priority,
        },
      );
    }

    if (filters.clientId) {
      query.andWhere(
        "ticket.clientId = :clientId",
        {
          clientId: filters.clientId,
        },
      );
    }

    if (filters.assignedToUserId) {
      query.andWhere(
        "ticket.assignedToUserId = :assignedToUserId",
        {
          assignedToUserId:
            filters.assignedToUserId,
        },
      );
    }

    if (filters.search?.trim()) {
      const search = `%${filters.search.trim()}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            "ticket.title ILIKE :search",
            {
              search,
            },
          )
            .orWhere(
              "ticket.description ILIKE :search",
              {
                search,
              },
            )
            .orWhere(
              "client.name ILIKE :search",
              {
                search,
              },
            );
        }),
      );
    }

    /**
     * Vencido:
     * fecha límite pasada y todavía activo.
     */
    if (filters.overdue) {
      query.andWhere(
        "ticket.dueAt < NOW()",
      );

      query.andWhere(
        "status.code NOT IN (:...inactiveStatuses)",
        {
          inactiveStatuses: [
            TicketStatusCode.RESOLVED,
            TicketStatusCode.CLOSED,
          ],
        },
      );
    }

    /**
     * La consulta SQL requerida en la prueba define
     * "más de 48 horas sin actualización y no cerrado".
     */
    if (filters.stale) {
      query.andWhere(
        `ticket.updatedAt < NOW() - INTERVAL '48 hours'`,
      );

      query.andWhere(
        "status.code != :closedStatus",
        {
          closedStatus:
            TicketStatusCode.CLOSED,
        },
      );
    }

    const sortColumns: Record<
      TicketSortBy,
      string
    > = {
      [TicketSortBy.CREATED_AT]:
        "ticket.createdAt",

      [TicketSortBy.UPDATED_AT]:
        "ticket.updatedAt",

      [TicketSortBy.DUE_AT]:
        "ticket.dueAt",

      [TicketSortBy.PRIORITY]:
        "priority.weight",
    };

    query.orderBy(
      sortColumns[filters.sortBy],
      filters.sortOrder ?? SortOrder.DESC,
    );

    const skip =
      (filters.page - 1) *
      filters.limit;

    query.skip(skip).take(filters.limit);

    const [
      tickets,
      total,
    ] =
      await query.getManyAndCount();

    return {
      data: tickets.map((ticket) =>
        this.mapListItem(ticket),
      ),

      meta: {
        page: filters.page,
        limit: filters.limit,
        total,

        totalPages:
          Math.ceil(
            total /
              filters.limit,
          ),
      },
    };
  }

  /*
   * ============================================================
   * DETAIL
   * ============================================================
   */

  async findOne(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    const ticket =
      await this.findTicketEntity(id);

    this.ticketPolicy.assertCanReadTicket(
      user,
      ticket,
    );

    const comments =
      await this.commentRepository.find({
        where:
          this.ticketPolicy.canViewInternalComments(
            user,
          )
            ? {
                ticketId: id,
              }
            : {
                ticketId: id,
                isInternal: false,
              },

        relations: {
          user: true,
        },

        order: {
          createdAt: "ASC",
        },
      });

    const assignmentHistory =
      await this.assignmentHistoryRepository.find(
        {
          where: {
            ticketId: id,
          },

          relations: {
            fromUser: true,
            toUser: true,
            assignedByUser: true,
          },

          order: {
            createdAt: "ASC",
          },
        },
      );

    const statusHistory =
      await this.statusHistoryRepository.find({
        where: {
          ticketId: id,
        },

        relations: {
          fromStatus: true,
          toStatus: true,
          changedByUser: true,
        },

        order: {
          createdAt: "ASC",
        },
      });

    return {
      ...this.mapListItem(ticket),

      description:
        ticket.description,

      createdBy:
        this.mapUser(
          ticket.createdByUser,
        )!,

      resolvedBy:
        this.mapUser(
          ticket.resolvedByUser,
        ),

      resolvedAt:
        ticket.resolvedAt,

      closedAt:
        ticket.closedAt,

      comments:
        comments.map(
          (comment) => ({
            id: comment.id,

            content:
              comment.content,

            isInternal:
              comment.isInternal,

            createdAt:
              comment.createdAt,

            updatedAt:
              comment.updatedAt,

            user: {
              id: comment.user.id,
              name: comment.user.name,
              email:
                comment.user.email,
            },
          }),
        ),

      assignmentHistory:
        assignmentHistory.map(
          (history) =>
            this.mapAssignmentHistory(
              history,
            ),
        ),

      statusHistory:
        statusHistory.map(
          (history) =>
            this.mapStatusHistory(
              history,
            ),
        ),
    };
  }

  /*
   * ============================================================
   * CREATE
   * ============================================================
   */

  async create(
    dto: CreateTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.create",
    );

    let createdTicketId = "";

    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const statusRepository =
          manager.getRepository(
            TicketStatusEntity,
          );

        const priorityRepository =
          manager.getRepository(
            TicketPriorityEntity,
          );

        const clientRepository =
          manager.getRepository(
            ClientEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketStatusHistoryEntity,
          );

        const client =
          await clientRepository.findOne({
            where: {
              id: dto.clientId,
              isActive: true,
            },
          });

        if (!client) {
          throw new BadRequestException(
            "The selected client does not exist or is inactive.",
          );
        }

        const priority =
          await priorityRepository.findOneBy(
            {
              id: dto.priorityId,
            },
          );

        if (!priority) {
          throw new BadRequestException(
            "Invalid ticket priority.",
          );
        }

        const openStatus =
          await statusRepository.findOne({
            where: {
              code: TicketStatusCode.OPEN,
            },
          });

        if (!openStatus) {
          throw new Error(
            "OPEN ticket status is not configured.",
          );
        }

        const ticket =
          ticketRepository.create({
            clientId:
              client.id,

            createdByUserId:
              user.id,

            assignedToUserId:
              null,

            resolvedByUserId:
              null,

            statusId:
              openStatus.id,

            priorityId:
              priority.id,

            title:
              dto.title.trim(),

            description:
              dto.description.trim(),

            dueAt:
              dto.dueAt
                ? new Date(
                    dto.dueAt,
                  )
                : null,

            resolvedAt:
              null,

            closedAt:
              null,

            deletedByUserId:
              null,
          });

        const saved =
          await ticketRepository.save(
            ticket,
          );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              saved.id,

            fromStatusId:
              null,

            toStatusId:
              openStatus.id,

            changedByUserId:
              user.id,
          }),
        );

        createdTicketId =
          saved.id;
      },
    );

    return this.findOne(
      createdTicketId,
      user,
    );
  }

  /*
   * ============================================================
   * UPDATE BASIC INFORMATION
   * ============================================================
   */

  async update(
    id: string,
    dto: UpdateTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    const ticket =
      await this.findTicketEntity(id);

    this.ticketPolicy.assertCanUpdateTicket(
      user,
      ticket,
    );

    const hasGlobalUpdate =
      user.permissions.includes(
        "tickets.update.any",
      );

    /**
     * El agente puede editar contenido/prioridad,
     * pero no reasociar el ticket a otro cliente
     * ni modificar arbitrariamente el SLA.
     */
    if (!hasGlobalUpdate) {
      if (
        dto.clientId !== undefined ||
        dto.dueAt !== undefined
      ) {
        throw new ForbiddenException(
          "Only users with global update permission can change client or due date.",
        );
      }
    }

    if (dto.clientId) {
      const client =
        await this.clientsService.findActiveById(
          dto.clientId,
        );

      if (!client) {
        throw new BadRequestException(
          "The selected client does not exist or is inactive.",
        );
      }

      ticket.clientId =
        client.id;
    }

    if (dto.priorityId) {
      const priority =
        await this.priorityRepository.findOneBy(
          {
            id: dto.priorityId,
          },
        );

      if (!priority) {
        throw new BadRequestException(
          "Invalid ticket priority.",
        );
      }

      ticket.priorityId =
        priority.id;
    }

    if (dto.title !== undefined) {
      ticket.title =
        dto.title.trim();
    }

    if (
      dto.description !== undefined
    ) {
      ticket.description =
        dto.description.trim();
    }

    if (dto.dueAt !== undefined) {
      ticket.dueAt =
        new Date(dto.dueAt);
    }

    await this.ticketRepository.save(
      ticket,
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * INITIAL ASSIGNMENT
   * ============================================================
   */

  async assign(
    id: string,
    dto: AssignTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.assign",
    );

    const agent =
      await this.usersService.findActiveSupportAgentById(
        dto.userId,
      );

    if (!agent) {
      throw new BadRequestException(
        "The selected user is not an active support agent.",
      );
    }

    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketAssignmentHistoryEntity,
          );

        const ticket =
          await ticketRepository.findOne({
            where: {
              id,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        if (
          ticket.assignedToUserId
        ) {
          throw new ConflictException(
            "Ticket is already assigned. Use the reassignment operation instead.",
          );
        }

        ticket.assignedToUserId =
          agent.id;

        ticket.updatedAt =
          new Date();

        await ticketRepository.save(
          ticket,
        );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              ticket.id,

            fromUserId:
              null,

            toUserId:
              agent.id,

            assignedByUserId:
              user.id,

            eventType:
              TicketAssignmentEventType.ASSIGNED,
          }),
        );
      },
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * REASSIGNMENT
   * ============================================================
   */

  async reassign(
    id: string,
    dto: ReassignTicketDto,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.reassign",
    );

    const newAgent =
      await this.usersService.findActiveSupportAgentById(
        dto.userId,
      );

    if (!newAgent) {
      throw new BadRequestException(
        "The selected user is not an active support agent.",
      );
    }

    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketAssignmentHistoryEntity,
          );

        const ticket =
          await ticketRepository.findOne({
            where: {
              id,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        if (
          !ticket.assignedToUserId
        ) {
          throw new ConflictException(
            "Ticket is not currently assigned. Use the initial assignment operation.",
          );
        }

        if (
          ticket.assignedToUserId ===
          newAgent.id
        ) {
          throw new BadRequestException(
            "Ticket is already assigned to that agent.",
          );
        }

        const previousAgentId =
          ticket.assignedToUserId;

        ticket.assignedToUserId =
          newAgent.id;

        ticket.updatedAt =
          new Date();

        await ticketRepository.save(
          ticket,
        );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              ticket.id,

            fromUserId:
              previousAgentId,

            toUserId:
              newAgent.id,

            assignedByUserId:
              user.id,

            eventType:
              TicketAssignmentEventType.REASSIGNED,
          }),
        );
      },
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * STATUS CHANGE
   * ============================================================
   */

  async changeStatus(
    id: string,
    dto: ChangeTicketStatusDto,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const statusRepository =
          manager.getRepository(
            TicketStatusEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketStatusHistoryEntity,
          );

        const ticket =
          await ticketRepository.findOne({
            where: {
              id,
            },

            relations: {
              status: true,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        this.ticketPolicy.assertCanChangeStatus(
          user,
          ticket,
        );

        if (
          dto.status ===
          TicketStatusCode.CLOSED
        ) {
          throw new BadRequestException(
            "Use the dedicated close ticket endpoint.",
          );
        }

        if (
          ticket.status.code ===
          TicketStatusCode.CLOSED
        ) {
          throw new BadRequestException(
            "Closed tickets must be reopened before changing status.",
          );
        }

        if (
          ticket.status.code ===
          dto.status
        ) {
          throw new BadRequestException(
            "Ticket already has the requested status.",
          );
        }

        this.assertValidStatusTransition(
          ticket.status.code as TicketStatusCode,
          dto.status,
        );

        const targetStatus =
          await statusRepository.findOne({
            where: {
              code: dto.status,
            },
          });

        if (!targetStatus) {
          throw new BadRequestException(
            "Requested ticket status is not configured.",
          );
        }

        const previousStatusId =
          ticket.statusId;

        const previousStatusCode =
          ticket.status.code;

        ticket.statusId =
          targetStatus.id;

        /**
         * Cuando un usuario resuelve:
         * registramos quién y cuándo.
         */
        if (
          dto.status ===
          TicketStatusCode.RESOLVED
        ) {
          ticket.resolvedAt =
            new Date();

          ticket.resolvedByUserId =
            user.id;
        }

        /**
         * Si un RESOLVED vuelve a trabajo activo,
         * deja de considerarse resuelto.
         */
        if (
          previousStatusCode ===
            TicketStatusCode.RESOLVED &&
          dto.status !==
            TicketStatusCode.RESOLVED
        ) {
          ticket.resolvedAt =
            null;

          ticket.resolvedByUserId =
            null;
        }

        ticket.updatedAt =
          new Date();

        await ticketRepository.save(
          ticket,
        );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              ticket.id,

            fromStatusId:
              previousStatusId,

            toStatusId:
              targetStatus.id,

            changedByUserId:
              user.id,
          }),
        );
      },
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * CLOSE
   * ============================================================
   */

  async close(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.close",
    );

    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const statusRepository =
          manager.getRepository(
            TicketStatusEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketStatusHistoryEntity,
          );

        const ticket =
          await ticketRepository.findOne({
            where: {
              id,
            },

            relations: {
              status: true,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        if (
          ticket.status.code ===
          TicketStatusCode.CLOSED
        ) {
          throw new ConflictException(
            "Ticket is already closed.",
          );
        }

        const closedStatus =
          await statusRepository.findOne({
            where: {
              code: TicketStatusCode.CLOSED,
            },
          });

        if (!closedStatus) {
          throw new Error(
            "CLOSED ticket status is not configured.",
          );
        }

        const previousStatusId =
          ticket.statusId;

        ticket.statusId =
          closedStatus.id;

        ticket.closedAt =
          new Date();

        ticket.updatedAt =
          new Date();

        await ticketRepository.save(
          ticket,
        );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              ticket.id,

            fromStatusId:
              previousStatusId,

            toStatusId:
              closedStatus.id,

            changedByUserId:
              user.id,
          }),
        );
      },
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * REOPEN
   * ============================================================
   */

  async reopen(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketDetailResponseDto> {
    this.ticketPolicy.assertHasPermission(
      user,
      "tickets.reopen",
    );

    await this.dataSource.transaction(
      async (manager) => {
        const ticketRepository =
          manager.getRepository(
            TicketEntity,
          );

        const statusRepository =
          manager.getRepository(
            TicketStatusEntity,
          );

        const historyRepository =
          manager.getRepository(
            TicketStatusHistoryEntity,
          );

        const ticket =
          await ticketRepository.findOne({
            where: {
              id,
            },

            relations: {
              status: true,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        if (
          ticket.status.code !==
          TicketStatusCode.CLOSED
        ) {
          throw new ConflictException(
            "Only closed tickets can be reopened.",
          );
        }

        const openStatus =
          await statusRepository.findOne({
            where: {
              code: TicketStatusCode.OPEN,
            },
          });

        if (!openStatus) {
          throw new Error(
            "OPEN ticket status is not configured.",
          );
        }

        const previousStatusId =
          ticket.statusId;

        ticket.statusId =
          openStatus.id;

        ticket.closedAt =
          null;

        ticket.resolvedAt =
          null;

        ticket.resolvedByUserId =
          null;

        ticket.updatedAt =
          new Date();

        await ticketRepository.save(
          ticket,
        );

        await historyRepository.save(
          historyRepository.create({
            ticketId:
              ticket.id,

            fromStatusId:
              previousStatusId,

            toStatusId:
              openStatus.id,

            changedByUserId:
              user.id,
          }),
        );
      },
    );

    return this.findOne(
      id,
      user,
    );
  }

  /*
   * ============================================================
   * SOFT DELETE
   * ============================================================
   */

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    this.ticketPolicy.assertCanDelete(
      user,
    );

    await this.dataSource.transaction(
      async (manager) => {
        const repository =
          manager.getRepository(
            TicketEntity,
          );

        const ticket =
          await repository.findOne({
            where: {
              id,
            },
          });

        if (!ticket) {
          throw new NotFoundException(
            "Ticket not found.",
          );
        }

        /**
         * Primero registramos quién solicitó la eliminación.
         */
        ticket.deletedByUserId =
          user.id;

        await repository.save(
          ticket,
        );

        /**
         * TypeORM establecerá deleted_at.
         */
        await repository.softRemove(
          ticket,
        );
      },
    );
  }

  /*
   * ============================================================
   * HISTORY
   * ============================================================
   */

  async getAssignmentHistory(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketAssignmentHistoryResponseDto[]> {
    const ticket =
      await this.findTicketEntity(id);

    this.ticketPolicy.assertCanReadTicket(
      user,
      ticket,
    );

    const history =
      await this.assignmentHistoryRepository.find(
        {
          where: {
            ticketId: id,
          },

          relations: {
            fromUser: true,
            toUser: true,
            assignedByUser: true,
          },

          order: {
            createdAt: "ASC",
          },
        },
      );

    return history.map(
      (item) =>
        this.mapAssignmentHistory(
          item,
        ),
    );
  }

  async getStatusHistory(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TicketStatusHistoryResponseDto[]> {
    const ticket =
      await this.findTicketEntity(id);

    this.ticketPolicy.assertCanReadTicket(
      user,
      ticket,
    );

    const history =
      await this.statusHistoryRepository.find({
        where: {
          ticketId: id,
        },

        relations: {
          fromStatus: true,
          toStatus: true,
          changedByUser: true,
        },

        order: {
          createdAt: "ASC",
        },
      });

    return history.map(
      (item) =>
        this.mapStatusHistory(
          item,
        ),
    );
  }

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  private async findTicketEntity(
    id: string,
  ): Promise<TicketEntity> {
    const ticket =
      await this.ticketRepository.findOne({
        where: {
          id,
        },

        relations: {
          client: true,
          status: true,
          priority: true,
          createdByUser: true,
          assignedToUser: true,
          resolvedByUser: true,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        "Ticket not found.",
      );
    }

    return ticket;
  }

  private assertValidStatusTransition(
    current: TicketStatusCode,
    target: TicketStatusCode,
  ): void {
    const allowedTransitions: Record<
      TicketStatusCode,
      TicketStatusCode[]
    > = {
      [TicketStatusCode.OPEN]: [
        TicketStatusCode.IN_PROGRESS,
        TicketStatusCode.RESOLVED,
      ],

      [TicketStatusCode.IN_PROGRESS]: [
        TicketStatusCode.OPEN,
        TicketStatusCode.RESOLVED,
      ],

      [TicketStatusCode.RESOLVED]: [
        TicketStatusCode.IN_PROGRESS,
      ],

      [TicketStatusCode.CLOSED]: [],
    };

    if (
      !allowedTransitions[
        current
      ].includes(target)
    ) {
      throw new BadRequestException(
        `Invalid status transition: ${current} -> ${target}`,
      );
    }
  }

  private mapUser(
    user:
      | {
          id: string;
          name: string;
          email: string;
        }
      | null
      | undefined,
  ): TicketUserSummaryDto | null {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private mapListItem(
    ticket: TicketEntity,
  ): TicketListItemDto {
    const now =
      new Date();

    const isOverdue =
      !!ticket.dueAt &&
      ticket.dueAt < now &&
      ![
        TicketStatusCode.RESOLVED,
        TicketStatusCode.CLOSED,
      ].includes(
        ticket.status
          .code as TicketStatusCode,
      );

    const staleLimit =
      Date.now() -
      48 * 60 * 60 * 1000;

    const isStale =
      ticket.updatedAt.getTime() <
        staleLimit &&
      ticket.status.code !==
        TicketStatusCode.CLOSED;

    return {
      id: ticket.id,

      title:
        ticket.title,

      status: {
        id: ticket.status.id,
        code: ticket.status.code,
        name: ticket.status.name,
      },

      priority: {
        id: ticket.priority.id,
        code: ticket.priority.code,
        name: ticket.priority.name,
      },

      client: {
        id: ticket.client.id,
        name: ticket.client.name,
        email:
          ticket.client.email,

        companyName:
          ticket.client
            .companyName,
      },

      assignedTo:
        this.mapUser(
          ticket.assignedToUser,
        ),

      dueAt:
        ticket.dueAt,

      createdAt:
        ticket.createdAt,

      updatedAt:
        ticket.updatedAt,

      isOverdue,

      isStale,
    };
  }

  private mapAssignmentHistory(
    history: TicketAssignmentHistoryEntity,
  ): TicketAssignmentHistoryResponseDto {
    return {
      id: history.id,

      eventType:
        history.eventType,

      fromUser:
        this.mapUser(
          history.fromUser,
        ),

      toUser:
        this.mapUser(
          history.toUser,
        )!,

      assignedBy:
        this.mapUser(
          history.assignedByUser,
        )!,

      createdAt:
        history.createdAt,
    };
  }

  private mapStatusHistory(
    history: TicketStatusHistoryEntity,
  ): TicketStatusHistoryResponseDto {
    return {
      id: history.id,

      fromStatus:
        history.fromStatus
          ? {
              id:
                history
                  .fromStatus.id,

              code:
                history
                  .fromStatus.code,

              name:
                history
                  .fromStatus.name,
            }
          : null,

      toStatus: {
        id:
          history.toStatus.id,

        code:
          history.toStatus.code,

        name:
          history.toStatus.name,
      },

      changedBy:
        this.mapUser(
          history.changedByUser,
        )!,

      createdAt:
        history.createdAt,
    };
  }
}