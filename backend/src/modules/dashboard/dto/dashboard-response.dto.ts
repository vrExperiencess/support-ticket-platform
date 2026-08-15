/**
 * El dashboard usa un contrato flexible porque cada widget
 * devuelve una estructura de datos distinta.
 */

export type DashboardWidgetType =
  | "metric"
  | "my_tickets"
  | "operational"
  | "distribution"
  | "agent_performance";

export class DashboardWidgetResponseDto {
  key!: string;

  type!: DashboardWidgetType;

  title!: string;

  description!: string | null;

  sortOrder!: number;

  config!: Record<string, unknown>;

  data!: unknown;
}

export class DashboardResponseDto {
  generatedAt!: Date;

  role!: {
    id: string;
    code: string;
    name: string;
  };

  widgets!: DashboardWidgetResponseDto[];
}

/*
 * ============================================================
 * OPEN TICKETS
 * ============================================================
 */

export class OpenTicketsWidgetDataDto {
  open!: number;

  inProgress!: number;

  /**
   * Trabajo todavía operativo:
   * OPEN + IN_PROGRESS
   */
  active!: number;

  resolved!: number;
}

/*
 * ============================================================
 * AGENT / MY TICKETS
 * ============================================================
 */

export class MyTicketsWidgetDataDto {
  assigned!: number;

  open!: number;

  inProgress!: number;

  resolved!: number;

  critical!: number;

  overdue!: number;
}

/*
 * ============================================================
 * OVERDUE / STALE
 * ============================================================
 */

export class OverdueTicketItemDto {
  id!: string;

  title!: string;

  dueAt!: Date | null;

  updatedAt!: Date;

  priority!: string;

  assignedTo!: string | null;
}

export class OverdueTicketsWidgetDataDto {
  overdue!: number;

  stale!: number;

  tickets!: OverdueTicketItemDto[];
}

/*
 * ============================================================
 * GLOBAL METRICS
 * ============================================================
 */

export class DashboardDistributionItemDto {
  code!: string;

  name!: string;

  value!: number;
}

export class GlobalMetricsWidgetDataDto {
  total!: number;

  active!: number;

  unassigned!: number;

  critical!: number;

  statusDistribution!: DashboardDistributionItemDto[];

  priorityDistribution!: DashboardDistributionItemDto[];
}

/*
 * ============================================================
 * AGENT PERFORMANCE
 * ============================================================
 */

export class AgentPerformanceItemDto {
  id!: string;

  name!: string;

  email!: string;

  activeAssigned!: number;

  resolvedLast30Days!: number;

  overdue!: number;
}

export class AgentPerformanceWidgetDataDto {
  agents!: AgentPerformanceItemDto[];
}