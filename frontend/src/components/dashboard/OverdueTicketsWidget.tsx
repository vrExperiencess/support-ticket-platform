// src/components/dashboard/OverdueTicketsWidget.tsx

import {
  AlertTriangle,
  ChevronRight,
  Clock3,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  DashboardOverdueTicket,
  DashboardWidget,
  OverdueTicketsWidgetData,
} from "../../features/dashboard/dashboard.types";

function formatDate(
  value:
    | string
    | null,
): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(value),
  );
}

interface OverdueTicketsWidgetProps {
  widget:
    DashboardWidget<OverdueTicketsWidgetData>;
}

export default function OverdueTicketsWidget({
  widget,
}: OverdueTicketsWidgetProps) {
  const navigate =
    useNavigate();

  return (
    <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-extrabold text-navy-900">
            {widget.title}
          </h2>

          <p className="mt-1 text-xs text-corporate-muted">
            Tickets requiring
            operational
            attention.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="rounded-xl bg-red-50 px-3 py-2">
            <div className="text-xl font-extrabold text-red-600">
              {
                widget.data
                  .overdue
              }
            </div>

            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-red-500">
              Overdue
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 px-3 py-2">
            <div className="text-xl font-extrabold text-amber-700">
              {
                widget.data
                  .stale
              }
            </div>

            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-600">
              Stale
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 divide-y divide-corporate-border">
        {widget.data.tickets.map(
          (
            ticket:
              DashboardOverdueTicket,
          ) => (
            <button
              key={
                ticket.id
              }
              type="button"
              onClick={() =>
                navigate(
                  `/tickets/${ticket.id}`,
                )
              }
              className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-navy-50/60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertTriangle
                  size={16}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold text-navy-900">
                  {
                    ticket.title
                  }
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-navy-400">
                  <span className="flex items-center gap-1">
                    <Clock3
                      size={10}
                    />

                    Due{" "}
                    {formatDate(
                      ticket.dueAt,
                    )}
                  </span>

                  <span>
                    {ticket.assignedTo ??
                      "Unassigned"}
                  </span>

                  <span>
                    {
                      ticket.priority
                    }
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className="text-navy-300"
              />
            </button>
          ),
        )}

        {widget.data.tickets
          .length === 0 && (
          <div className="py-8 text-center text-xs text-navy-400">
            No overdue tickets.
          </div>
        )}
      </div>
    </section>
  );
}