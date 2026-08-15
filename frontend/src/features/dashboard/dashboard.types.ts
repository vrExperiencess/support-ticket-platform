// src/features/dashboard/dashboard.types.ts

export type DashboardWidgetType =
  | "metric"
  | "my_tickets"
  | "operational"
  | "distribution"
  | "agent_performance";

export interface DashboardWidget<
  T = unknown,
> {
  key: string;

  type:
    DashboardWidgetType;

  title: string;

  description:
    | string
    | null;

  sortOrder: number;

  config: Record<
    string,
    unknown
  >;

  data: T;
}

export interface DashboardResponse {
  generatedAt: string;

  role: {
    id: string;
    code: string;
    name: string;
  };

  widgets:
    DashboardWidget[];
}

/*
 * OPEN TICKETS
 */

export interface OpenTicketsWidgetData {
  open: number;

  inProgress: number;

  active: number;

  resolved: number;
}

/*
 * MY TICKETS
 */

export interface MyTicketsWidgetData {
  assigned: number;

  open: number;

  inProgress: number;

  resolved: number;

  critical: number;

  overdue: number;
}

/*
 * OVERDUE
 */

export interface DashboardOverdueTicket {
  id: string;

  title: string;

  dueAt:
    | string
    | null;

  updatedAt: string;

  priority: string;

  assignedTo:
    | string
    | null;
}

export interface OverdueTicketsWidgetData {
  overdue: number;

  stale: number;

  tickets:
    DashboardOverdueTicket[];
}

/*
 * DISTRIBUTIONS
 */

export interface DashboardDistributionItem {
  code: string;

  name: string;

  value: number;
}

export interface GlobalMetricsWidgetData {
  total: number;

  active: number;

  unassigned: number;

  critical: number;

  statusDistribution:
    DashboardDistributionItem[];

  priorityDistribution:
    DashboardDistributionItem[];
}

/*
 * AGENTS
 */

export interface AgentPerformanceItem {
  id: string;

  name: string;

  email: string;

  activeAssigned: number;

  resolvedLast30Days: number;

  overdue: number;
}

export interface AgentPerformanceWidgetData {
  agents:
    AgentPerformanceItem[];
}