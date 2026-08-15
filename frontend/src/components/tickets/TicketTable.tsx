import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  Inbox,
} from "lucide-react";

import type {
  TicketListItem,
} from "../../features/tickets/ticket.types";

import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";

interface TicketTableProps {
  tickets: TicketListItem[];

  loading: boolean;

  onSelect: (
    ticket: TicketListItem,
  ) => void;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

export default function TicketTable({
  tickets,
  loading,
  onSelect,
}: TicketTableProps) {
  if (loading) {
    return (
      <div className="rounded-panel border border-corporate-border bg-white p-12 text-center shadow-card">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />

        <p className="mt-4 text-xs font-semibold text-navy-400">
          Loading tickets...
        </p>
      </div>
    );
  }

  if (
    tickets.length === 0
  ) {
    return (
      <div className="rounded-panel border border-corporate-border bg-white p-12 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
          <Inbox size={22} />
        </div>

        <h3 className="mt-4 text-sm font-extrabold text-navy-900">
          No tickets found
        </h3>

        <p className="mt-2 text-xs text-corporate-muted">
          Try changing the
          current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-panel border border-corporate-border bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-corporate-border bg-navy-50/60 text-left">
              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Ticket
              </th>

              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Client
              </th>

              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Status
              </th>

              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Priority
              </th>

              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Agent
              </th>

              <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-navy-400">
                Updated
              </th>

              <th className="w-12" />
            </tr>
          </thead>

          <tbody>
            {tickets.map(
              (ticket) => (
                <tr
                  key={
                    ticket.id
                  }
                  onClick={() =>
                    onSelect(
                      ticket,
                    )
                  }
                  className="cursor-pointer border-b border-corporate-border/70 transition last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-4">
                    <div className="max-w-[340px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-extrabold text-navy-900">
                          {
                            ticket.title
                          }
                        </span>

                        {ticket.isOverdue && (
                          <span
                            title="Overdue"
                            className="text-red-500"
                          >
                            <AlertTriangle
                              size={14}
                            />
                          </span>
                        )}

                        {ticket.isStale && (
                          <span
                            title="No activity >48h"
                            className="text-amber-500"
                          >
                            <Clock3
                              size={14}
                            />
                          </span>
                        )}
                      </div>

                      <div className="mt-1 font-mono text-[9px] text-navy-300">
                        {ticket.id}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-xs font-semibold text-navy-700">
                      {
                        ticket.client
                          .name
                      }
                    </div>

                    {ticket.client
                      .companyName && (
                      <div className="mt-1 text-[10px] text-navy-400">
                        {
                          ticket
                            .client
                            .companyName
                        }
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <TicketStatusBadge
                      code={
                        ticket
                          .status
                          .code
                      }
                      name={
                        ticket
                          .status
                          .name
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <TicketPriorityBadge
                      code={
                        ticket
                          .priority
                          .code
                      }
                      name={
                        ticket
                          .priority
                          .name
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-[9px] font-extrabold text-white">
                          {ticket.assignedTo.name
                            .substring(
                              0,
                              2,
                            )
                            .toUpperCase()}
                        </div>

                        <span className="text-xs font-semibold text-navy-700">
                          {
                            ticket
                              .assignedTo
                              .name
                          }
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-[10px] text-navy-400">
                    {formatDate(
                      ticket.updatedAt,
                    )}
                  </td>

                  <td className="px-3">
                    <ChevronRight
                      size={17}
                      className="text-navy-300"
                    />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}