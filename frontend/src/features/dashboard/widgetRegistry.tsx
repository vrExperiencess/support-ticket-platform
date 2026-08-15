// src/features/dashboard/widgetRegistry.tsx

import type {
  ComponentType,
} from "react";

import AgentPerformanceWidget from "../../components/dashboard/AgentPerformanceWidget";
import GlobalMetricsWidget from "../../components/dashboard/GlobalMetricsWidget";
import MyTicketsWidget from "../../components/dashboard/MyTicketsWidget";
import OpenTicketsWidget from "../../components/dashboard/OpenTicketsWidget";
import OverdueTicketsWidget from "../../components/dashboard/OverdueTicketsWidget";

import type {
  DashboardWidget,
} from "./dashboard.types";

export interface DashboardWidgetComponentProps {
  widget:
    DashboardWidget<any>;
}

/**
 * Registry central.
 *
 * Si mañana aparece:
 *
 * customer_satisfaction
 *
 * simplemente creamos su componente y lo registramos aquí.
 */
export const widgetRegistry: Record<
  string,
  ComponentType<DashboardWidgetComponentProps>
> = {
  open_tickets:
    OpenTicketsWidget,

  my_tickets:
    MyTicketsWidget,

  overdue_tickets:
    OverdueTicketsWidget,

  global_metrics:
    GlobalMetricsWidget,

  agent_performance:
    AgentPerformanceWidget,
};