import { DataSource, In } from "typeorm";

import { DashboardWidgetEntity } from "../../../modules/dashboard/entities/dashboard-widget.entity";
import { RoleDashboardWidgetEntity } from "../../../modules/dashboard/entities/role-dashboard-widget.entity";

import { ROLE_IDS } from "./roles.seed";

export const DASHBOARD_WIDGET_IDS = {
  OPEN_TICKETS: "a0000000-0000-4000-8000-000000000001",
  MY_TICKETS: "a0000000-0000-4000-8000-000000000002",
  OVERDUE_TICKETS: "a0000000-0000-4000-8000-000000000003",
  GLOBAL_METRICS: "a0000000-0000-4000-8000-000000000004",
  AGENT_PERFORMANCE: "a0000000-0000-4000-8000-000000000005",
} as const;

export async function seedDashboard(
  dataSource: DataSource,
): Promise<void> {
  const widgetRepository =
    dataSource.getRepository(DashboardWidgetEntity);

  const roleWidgetRepository =
    dataSource.getRepository(RoleDashboardWidgetEntity);

  const widgets = [
    {
      id: DASHBOARD_WIDGET_IDS.OPEN_TICKETS,
      key: "open_tickets",
      name: "Open Tickets",
      description: "Current number of open support tickets.",
      isActive: true,
    },
    {
      id: DASHBOARD_WIDGET_IDS.MY_TICKETS,
      key: "my_tickets",
      name: "My Tickets",
      description: "Tickets assigned to the authenticated support agent.",
      isActive: true,
    },
    {
      id: DASHBOARD_WIDGET_IDS.OVERDUE_TICKETS,
      key: "overdue_tickets",
      name: "Overdue Tickets",
      description: "Tickets overdue or without recent updates.",
      isActive: true,
    },
    {
      id: DASHBOARD_WIDGET_IDS.GLOBAL_METRICS,
      key: "global_metrics",
      name: "Global Metrics",
      description: "General operational ticket metrics.",
      isActive: true,
    },
    {
      id: DASHBOARD_WIDGET_IDS.AGENT_PERFORMANCE,
      key: "agent_performance",
      name: "Agent Performance",
      description: "Operational summary by support agent.",
      isActive: true,
    },
  ];

  await widgetRepository.upsert(widgets, ["id"]);

  await roleWidgetRepository.delete({
    roleId: In(Object.values(ROLE_IDS)),
  });

  const roleWidgets = [
    // ADMIN
    {
      roleId: ROLE_IDS.ADMIN,
      widgetId: DASHBOARD_WIDGET_IDS.OPEN_TICKETS,
      enabled: true,
      sortOrder: 1,
      config: { variant: "summary" },
    },
    {
      roleId: ROLE_IDS.ADMIN,
      widgetId: DASHBOARD_WIDGET_IDS.MY_TICKETS,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
    {
      roleId: ROLE_IDS.ADMIN,
      widgetId: DASHBOARD_WIDGET_IDS.OVERDUE_TICKETS,
      enabled: true,
      sortOrder: 2,
      config: { variant: "summary" },
    },
    {
      roleId: ROLE_IDS.ADMIN,
      widgetId: DASHBOARD_WIDGET_IDS.GLOBAL_METRICS,
      enabled: true,
      sortOrder: 3,
      config: { variant: "detailed" },
    },
    {
      roleId: ROLE_IDS.ADMIN,
      widgetId: DASHBOARD_WIDGET_IDS.AGENT_PERFORMANCE,
      enabled: true,
      sortOrder: 4,
      config: { variant: "table" },
    },

    // SUPERVISOR
    {
      roleId: ROLE_IDS.SUPERVISOR,
      widgetId: DASHBOARD_WIDGET_IDS.OPEN_TICKETS,
      enabled: true,
      sortOrder: 1,
      config: { variant: "summary" },
    },
    {
      roleId: ROLE_IDS.SUPERVISOR,
      widgetId: DASHBOARD_WIDGET_IDS.MY_TICKETS,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
    {
      roleId: ROLE_IDS.SUPERVISOR,
      widgetId: DASHBOARD_WIDGET_IDS.OVERDUE_TICKETS,
      enabled: true,
      sortOrder: 2,
      config: { variant: "summary" },
    },
    {
      roleId: ROLE_IDS.SUPERVISOR,
      widgetId: DASHBOARD_WIDGET_IDS.GLOBAL_METRICS,
      enabled: true,
      sortOrder: 3,
      config: { variant: "detailed" },
    },
    {
      roleId: ROLE_IDS.SUPERVISOR,
      widgetId: DASHBOARD_WIDGET_IDS.AGENT_PERFORMANCE,
      enabled: true,
      sortOrder: 4,
      config: { variant: "table" },
    },

    // SUPPORT AGENT
    {
      roleId: ROLE_IDS.SUPPORT_AGENT,
      widgetId: DASHBOARD_WIDGET_IDS.OPEN_TICKETS,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
    {
      roleId: ROLE_IDS.SUPPORT_AGENT,
      widgetId: DASHBOARD_WIDGET_IDS.MY_TICKETS,
      enabled: true,
      sortOrder: 1,
      config: { variant: "list" },
    },
    {
      roleId: ROLE_IDS.SUPPORT_AGENT,
      widgetId: DASHBOARD_WIDGET_IDS.OVERDUE_TICKETS,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
    {
      roleId: ROLE_IDS.SUPPORT_AGENT,
      widgetId: DASHBOARD_WIDGET_IDS.GLOBAL_METRICS,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
    {
      roleId: ROLE_IDS.SUPPORT_AGENT,
      widgetId: DASHBOARD_WIDGET_IDS.AGENT_PERFORMANCE,
      enabled: false,
      sortOrder: 99,
      config: null,
    },
  ];

  await roleWidgetRepository.save(roleWidgets);

  console.log("  ✓ Dashboard configuration seeded");
}