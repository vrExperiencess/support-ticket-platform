// src/components/dashboard/GlobalMetricsWidget.tsx

import {
  AlertTriangle,
  CircleSlash,
  Layers3,
  Ticket,
} from "lucide-react";

import type {
  DashboardDistributionItem,
  DashboardWidget,
  GlobalMetricsWidgetData,
} from "../../features/dashboard/dashboard.types";

import MetricCard from "./MetricCard";

interface GlobalMetricsWidgetProps {
  widget:
    DashboardWidget<GlobalMetricsWidgetData>;
}

function Distribution({
  title,
  items,
}: {
  title: string;

  items:
    DashboardDistributionItem[];
}) {
  const total =
    items.reduce(
      (
        accumulator:
          number,
        item:
          DashboardDistributionItem,
      ) =>
        accumulator +
        item.value,
      0,
    );

  return (
    <div className="rounded-xl border border-corporate-border p-5">
      <h3 className="text-xs font-extrabold text-navy-900">
        {title}
      </h3>

      <div className="mt-5 space-y-4">
        {items.map(
          (
            item:
              DashboardDistributionItem,
          ) => {
            const percentage =
              total > 0
                ? Math.round(
                    (item.value /
                      total) *
                      100,
                  )
                : 0;

            return (
              <div
                key={
                  item.code
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-600">
                    {
                      item.name
                    }
                  </span>

                  <span className="text-xs font-extrabold text-navy-900">
                    {
                      item.value
                    }
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-navy-50">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

export default function GlobalMetricsWidget({
  widget,
}: GlobalMetricsWidgetProps) {
  const {
    data,
  } =
    widget;

  return (
    <section>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total tickets"
          value={
            data.total
          }
          icon={Ticket}
        />

        <MetricCard
          label="Active"
          value={
            data.active
          }
          icon={Layers3}
        />

        <MetricCard
          label="Unassigned"
          value={
            data.unassigned
          }
          icon={
            CircleSlash
          }
          alert={
            data.unassigned >
            0
          }
        />

        <MetricCard
          label="Critical active"
          value={
            data.critical
          }
          icon={
            AlertTriangle
          }
          alert={
            data.critical >
            0
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Distribution
          title="Tickets by status"
          items={
            data.statusDistribution
          }
        />

        <Distribution
          title="Tickets by priority"
          items={
            data.priorityDistribution
          }
        />
      </div>
    </section>
  );
}