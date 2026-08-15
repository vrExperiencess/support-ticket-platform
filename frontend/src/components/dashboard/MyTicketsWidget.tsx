// src/components/dashboard/MyTicketsWidget.tsx

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Flame,
  PlayCircle,
  Ticket,
} from "lucide-react";

import type {
  DashboardWidget,
  MyTicketsWidgetData,
} from "../../features/dashboard/dashboard.types";

import MetricCard from "./MetricCard";

interface MyTicketsWidgetProps {
  widget:
    DashboardWidget<MyTicketsWidgetData>;
}

export default function MyTicketsWidget({
  widget,
}: MyTicketsWidgetProps) {
  const {
    data,
  } =
    widget;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-extrabold text-navy-900">
          {widget.title}
        </h2>

        {widget.description && (
          <p className="mt-1 text-xs text-corporate-muted">
            {
              widget.description
            }
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Assigned to me"
          value={
            data.assigned
          }
          icon={Ticket}
        />

        <MetricCard
          label="Open"
          value={
            data.open
          }
          icon={Clock3}
        />

        <MetricCard
          label="In progress"
          value={
            data.inProgress
          }
          icon={
            PlayCircle
          }
        />

        <MetricCard
          label="Resolved"
          value={
            data.resolved
          }
          icon={
            CheckCircle2
          }
        />

        <MetricCard
          label="Critical"
          value={
            data.critical
          }
          icon={Flame}
          alert={
            data.critical >
            0
          }
        />

        <MetricCard
          label="Overdue"
          value={
            data.overdue
          }
          icon={
            AlertTriangle
          }
          alert={
            data.overdue >
            0
          }
        />
      </div>
    </div>
  );
}