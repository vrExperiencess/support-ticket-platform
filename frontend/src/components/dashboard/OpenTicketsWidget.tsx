// src/components/dashboard/OpenTicketsWidget.tsx

import {
  CheckCircle2,
  Clock3,
  PlayCircle,
  Ticket,
} from "lucide-react";

import type {
  DashboardWidget,
  OpenTicketsWidgetData,
} from "../../features/dashboard/dashboard.types";

import MetricCard from "./MetricCard";

interface OpenTicketsWidgetProps {
  widget:
    DashboardWidget<OpenTicketsWidgetData>;
}

export default function OpenTicketsWidget({
  widget,
}: OpenTicketsWidgetProps) {
  const {
    data,
  } =
    widget;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Open tickets"
        value={
          data.open
        }
        description="Waiting for attention"
        icon={Ticket}
      />

      <MetricCard
        label="In progress"
        value={
          data.inProgress
        }
        description="Currently being handled"
        icon={
          PlayCircle
        }
      />

      <MetricCard
        label="Active workload"
        value={
          data.active
        }
        description="Open + in progress"
        icon={Clock3}
      />

      <MetricCard
        label="Resolved"
        value={
          data.resolved
        }
        description="Resolved but not necessarily closed"
        icon={
          CheckCircle2
        }
      />
    </section>
  );
}