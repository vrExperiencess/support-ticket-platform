// src/modules/dashboard/dashboard.service.ts

import {
  Injectable,
  Logger,
} from "@nestjs/common";

import {
  InjectRepository,
} from "@nestjs/typeorm";

import {
  Repository,
} from "typeorm";

import type {
  AuthenticatedUser,
} from "../auth/interfaces/authenticated-user.interface";

import {
  TicketEntity,
} from "../tickets/entities/ticket.entity";

import {
  TicketStatusCode,
} from "../tickets/enums/ticket.enums";

import {
  RoleDashboardWidgetEntity,
} from "./entities/role-dashboard-widget.entity";

import type {
  DashboardWidgetType,
} from "./dto/dashboard-response.dto";

import {
  AgentPerformanceWidgetDataDto,
  DashboardDistributionItemDto,
  DashboardResponseDto,
  DashboardWidgetResponseDto,
  GlobalMetricsWidgetDataDto,
  MyTicketsWidgetDataDto,
  OpenTicketsWidgetDataDto,
  OverdueTicketsWidgetDataDto,
} from "./dto/dashboard-response.dto";

@Injectable()
export class DashboardService {
  private readonly logger =
    new Logger(
      DashboardService.name,
    );

  constructor(
    @InjectRepository(
      RoleDashboardWidgetEntity,
    )
    private readonly roleWidgetRepository: Repository<RoleDashboardWidgetEntity>,

    @InjectRepository(
      TicketEntity,
    )
    private readonly ticketRepository: Repository<TicketEntity>,
  ) {}

  /**
   * Obtiene la configuración completa del dashboard
   * según el rol actualmente autenticado.
   *
   * El cliente NO indica qué widgets quiere cargar.
   * El backend decide según:
   *
   * role_dashboard_widgets
   * +
   * permissions actuales
   */
  async getDashboard(
    user: AuthenticatedUser,
  ): Promise<DashboardResponseDto> {
    const configuredWidgets =
      await this.roleWidgetRepository
        .createQueryBuilder(
          "roleWidget",
        )
        .innerJoinAndSelect(
          "roleWidget.widget",
          "widget",
        )
        .where(
          "roleWidget.roleId = :roleId",
          {
            roleId:
              user.role.id,
          },
        )
        .andWhere(
          "roleWidget.enabled = true",
        )
        .andWhere(
          "widget.isActive = true",
        )
        .orderBy(
          "roleWidget.sortOrder",
          "ASC",
        )
        .getMany();

    const widgets:
      DashboardWidgetResponseDto[] =
        [];

    /**
     * Lo hacemos secuencialmente porque actualmente son pocos widgets
     * y priorizamos una implementación fácil de mantener.
     *
     * Si el dashboard creciera considerablemente, podemos paralelizar
     * builders independientes con Promise.all.
     */
    for (
      const configuration
      of configuredWidgets
    ) {
      if (
        !this.isWidgetAllowed(
          configuration.widget.key,
          user,
        )
      ) {
        continue;
      }

      const widget =
        await this.buildWidget(
          configuration,
          user,
        );

      if (widget) {
        widgets.push(
          widget,
        );
      }
    }

    return {
      generatedAt:
        new Date(),

      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
      },

      widgets,
    };
  }

  /**
   * role_dashboard_widgets controla configuración visual,
   * pero los permisos siguen siendo la segunda barrera.
   *
   * Esto evita que una configuración incorrecta en DB
   * exponga métricas a un usuario sin autorización.
   */
  private isWidgetAllowed(
    widgetKey: string,
    user: AuthenticatedUser,
  ): boolean {
    switch (widgetKey) {
      case "open_tickets":
        return user.permissions.includes(
          "tickets.read",
        );

      case "my_tickets":
        return user.permissions.includes(
          "tickets.read",
        );

      case "overdue_tickets":
        return user.permissions.includes(
          "tickets.overdue.read",
        );

      case "global_metrics":
        return user.permissions.includes(
          "metrics.read",
        );

      case "agent_performance":
        return user.permissions.includes(
          "metrics.read",
        );

      default:
        return false;
    }
  }

  private async buildWidget(
    configuration:
      RoleDashboardWidgetEntity,

    user: AuthenticatedUser,
  ): Promise<DashboardWidgetResponseDto | null> {
    const key =
      configuration.widget.key;

    let type:
      DashboardWidgetType;

    let data: unknown;

    switch (key) {
      case "open_tickets":
        type = "metric";

        data =
          await this.getOpenTicketsData();

        break;

      case "my_tickets":
        type =
          "my_tickets";

        data =
          await this.getMyTicketsData(
            user.id,
          );

        break;

      case "overdue_tickets":
        type =
          "operational";

        data =
          await this.getOverdueTicketsData();

        break;

      case "global_metrics":
        type =
          "distribution";

        data =
          await this.getGlobalMetricsData();

        break;

      case "agent_performance":
        type =
          "agent_performance";

        data =
          await this.getAgentPerformanceData();

        break;

      default:
        this.logger.warn(
          `Dashboard widget "${key}" does not have a backend builder.`,
        );

        return null;
    }

    return {
      key,

      type,

      title:
        configuration.widget.name,

      description:
        configuration.widget.description,

      sortOrder:
        configuration.sortOrder,

      config:
        configuration.config ??
        {},

      data,
    };
  }

  /*
   * ============================================================
   * OPEN TICKETS
   * ============================================================
   */

  private async getOpenTicketsData(): Promise<OpenTicketsWidgetDataDto> {
    const [
      open,
      inProgress,
      resolved,
    ] =
      await Promise.all([
        this.countByStatus(
          TicketStatusCode.OPEN,
        ),

        this.countByStatus(
          TicketStatusCode.IN_PROGRESS,
        ),

        this.countByStatus(
          TicketStatusCode.RESOLVED,
        ),
      ]);

    return {
      open,

      inProgress,

      active:
        open +
        inProgress,

      resolved,
    };
  }

  /*
   * ============================================================
   * MY TICKETS
   * ============================================================
   */

  private async getMyTicketsData(
    userId: string,
  ): Promise<MyTicketsWidgetDataDto> {
    const assigned =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .where(
          "ticket.assignedToUserId = :userId",
          {
            userId,
          },
        )
        .getCount();

    const open =
      await this.countAssignedByStatus(
        userId,
        TicketStatusCode.OPEN,
      );

    const inProgress =
      await this.countAssignedByStatus(
        userId,
        TicketStatusCode.IN_PROGRESS,
      );

    const resolved =
      await this.countAssignedByStatus(
        userId,
        TicketStatusCode.RESOLVED,
      );

    const critical =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.priority",
          "priority",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          "ticket.assignedToUserId = :userId",
          {
            userId,
          },
        )
        .andWhere(
          "priority.code = :priority",
          {
            priority:
              "CRITICAL",
          },
        )
        .andWhere(
          "status.code NOT IN (:...terminalStatuses)",
          {
            terminalStatuses: [
              TicketStatusCode.RESOLVED,
              TicketStatusCode.CLOSED,
            ],
          },
        )
        .getCount();

    const overdue =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          "ticket.assignedToUserId = :userId",
          {
            userId,
          },
        )
        .andWhere(
          `ticket."due_at" < NOW()`,
        )
        .andWhere(
          "status.code NOT IN (:...terminalStatuses)",
          {
            terminalStatuses: [
              TicketStatusCode.RESOLVED,
              TicketStatusCode.CLOSED,
            ],
          },
        )
        .getCount();

    return {
      assigned,
      open,
      inProgress,
      resolved,
      critical,
      overdue,
    };
  }

  /*
   * ============================================================
   * OVERDUE / STALE
   * ============================================================
   */

  private async getOverdueTicketsData(): Promise<OverdueTicketsWidgetDataDto> {
    const overdue =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          `ticket."due_at" < NOW()`,
        )
        .andWhere(
          "status.code NOT IN (:...terminalStatuses)",
          {
            terminalStatuses: [
              TicketStatusCode.RESOLVED,
              TicketStatusCode.CLOSED,
            ],
          },
        )
        .getCount();

    const stale =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          `ticket."updated_at" < NOW() - INTERVAL '48 hours'`,
        )
        .andWhere(
          "status.code != :closed",
          {
            closed:
              TicketStatusCode.CLOSED,
          },
        )
        .getCount();

    /**
     * Solo devolvemos una pequeña muestra.
     *
     * El listado completo ya existe en:
     *
     * GET /tickets?overdue=true
     */
    const tickets =
        await this.ticketRepository
            .createQueryBuilder(
            "ticket",
            )
            .innerJoinAndSelect(
            "ticket.priority",
            "priority",
            )
            .innerJoinAndSelect(
            "ticket.status",
            "status",
            )
            .leftJoinAndSelect(
            "ticket.assignedToUser",
            "assignedTo",
            )
            .where(
            "ticket.dueAt < NOW()",
            )
            .andWhere(
            "status.code NOT IN (:...terminalStatuses)",
            {
                terminalStatuses: [
                TicketStatusCode.RESOLVED,
                TicketStatusCode.CLOSED,
                ],
            },
            )
            .orderBy(
            "ticket.dueAt",
            "ASC",
            )
            .take(5)
            .getMany();

    return {
      overdue,

      stale,

      tickets:
        tickets.map(
          (ticket) => ({
            id: ticket.id,

            title:
              ticket.title,

            dueAt:
              ticket.dueAt,

            updatedAt:
              ticket.updatedAt,

            priority:
              ticket.priority
                .code,

            assignedTo:
              ticket.assignedToUser
                ?.name ??
              null,
          }),
        ),
    };
  }

  /*
   * ============================================================
   * GLOBAL METRICS
   * ============================================================
   */

  private async getGlobalMetricsData(): Promise<GlobalMetricsWidgetDataDto> {
    const total =
      await this.ticketRepository.count();

    const active =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          "status.code IN (:...activeStatuses)",
          {
            activeStatuses: [
              TicketStatusCode.OPEN,
              TicketStatusCode.IN_PROGRESS,
            ],
          },
        )
        .getCount();

    const unassigned =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          "ticket.assignedToUserId IS NULL",
        )
        .andWhere(
          "status.code NOT IN (:...terminalStatuses)",
          {
            terminalStatuses: [
              TicketStatusCode.RESOLVED,
              TicketStatusCode.CLOSED,
            ],
          },
        )
        .getCount();

    const critical =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.priority",
          "priority",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .where(
          "priority.code = :critical",
          {
            critical:
              "CRITICAL",
          },
        )
        .andWhere(
          "status.code NOT IN (:...terminalStatuses)",
          {
            terminalStatuses: [
              TicketStatusCode.RESOLVED,
              TicketStatusCode.CLOSED,
            ],
          },
        )
        .getCount();

    const statusDistribution =
      await this.getStatusDistribution();

    const priorityDistribution =
      await this.getPriorityDistribution();

    return {
      total,
      active,
      unassigned,
      critical,

      statusDistribution,

      priorityDistribution,
    };
  }

  private async getStatusDistribution(): Promise<DashboardDistributionItemDto[]> {
    const rows =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .select(
          "status.code",
          "code",
        )
        .addSelect(
          "status.name",
          "name",
        )
        .addSelect(
          "COUNT(ticket.id)",
          "value",
        )
        .groupBy(
          "status.id",
        )
        .addGroupBy(
          "status.code",
        )
        .addGroupBy(
          "status.name",
        )
        .addGroupBy(
          "status.sortOrder",
        )
        .orderBy(
          "status.sortOrder",
          "ASC",
        )
        .getRawMany<{
          code: string;
          name: string;
          value: string;
        }>();

    return rows.map(
      (row) => ({
        code: row.code,
        name: row.name,

        value:
          Number(
            row.value,
          ),
      }),
    );
  }

  private async getPriorityDistribution(): Promise<DashboardDistributionItemDto[]> {
    const rows =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.priority",
          "priority",
        )
        .select(
          "priority.code",
          "code",
        )
        .addSelect(
          "priority.name",
          "name",
        )
        .addSelect(
          "COUNT(ticket.id)",
          "value",
        )
        .groupBy(
          "priority.id",
        )
        .addGroupBy(
          "priority.code",
        )
        .addGroupBy(
          "priority.name",
        )
        .addGroupBy(
          "priority.weight",
        )
        .orderBy(
          "priority.weight",
          "ASC",
        )
        .getRawMany<{
          code: string;
          name: string;
          value: string;
        }>();

    return rows.map(
      (row) => ({
        code: row.code,
        name: row.name,

        value:
          Number(
            row.value,
          ),
      }),
    );
  }

  /*
   * ============================================================
   * AGENT PERFORMANCE
   * ============================================================
   */

  private async getAgentPerformanceData(): Promise<AgentPerformanceWidgetDataDto> {
    /**
     * PostgreSQL FILTER permite calcular varias métricas
     * agrupadas en una única consulta.
     */
    const rows =
      await this.ticketRepository
        .createQueryBuilder(
          "ticket",
        )
        .innerJoin(
          "ticket.assignedToUser",
          "agent",
        )
        .innerJoin(
          "ticket.status",
          "status",
        )
        .select(
          "agent.id",
          "id",
        )
        .addSelect(
          "agent.name",
          "name",
        )
        .addSelect(
          "agent.email",
          "email",
        )
        .addSelect(
          `
          COUNT(ticket.id)
          FILTER (
            WHERE status.code IN ('OPEN', 'IN_PROGRESS')
          )
          `,
          "activeAssigned",
        )
        .addSelect(
          `
          COUNT(ticket.id)
          FILTER (
            WHERE ticket."resolved_at" >= NOW() - INTERVAL '30 days'
          )
          `,
          "resolvedLast30Days",
        )
        .addSelect(
          `
          COUNT(ticket.id)
          FILTER (
            WHERE ticket."due_at" < NOW()
            AND status.code IN ('OPEN', 'IN_PROGRESS')
          )
          `,
          "overdue",
        )
        .groupBy(
          "agent.id",
        )
        .addGroupBy(
          "agent.name",
        )
        .addGroupBy(
          "agent.email",
        )
        .orderBy(
          `"resolvedLast30Days"`,
          "DESC",
        )
        .getRawMany<{
          id: string;
          name: string;
          email: string;
          activeAssigned: string;
          resolvedLast30Days: string;
          overdue: string;
        }>();

    return {
      agents:
        rows.map(
          (row) => ({
            id: row.id,

            name:
              row.name,

            email:
              row.email,

            activeAssigned:
              Number(
                row.activeAssigned,
              ),

            resolvedLast30Days:
              Number(
                row.resolvedLast30Days,
              ),

            overdue:
              Number(
                row.overdue,
              ),
          }),
        ),
    };
  }

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  private async countByStatus(
    statusCode:
      TicketStatusCode,
  ): Promise<number> {
    return this.ticketRepository
      .createQueryBuilder(
        "ticket",
      )
      .innerJoin(
        "ticket.status",
        "status",
      )
      .where(
        "status.code = :statusCode",
        {
          statusCode,
        },
      )
      .getCount();
  }

  private async countAssignedByStatus(
    userId: string,
    statusCode:
      TicketStatusCode,
  ): Promise<number> {
    return this.ticketRepository
      .createQueryBuilder(
        "ticket",
      )
      .innerJoin(
        "ticket.status",
        "status",
      )
      .where(
        "ticket.assignedToUserId = :userId",
        {
          userId,
        },
      )
      .andWhere(
        "status.code = :statusCode",
        {
          statusCode,
        },
      )
      .getCount();
  }
}