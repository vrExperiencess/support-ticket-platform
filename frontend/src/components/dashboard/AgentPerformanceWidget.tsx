// src/components/dashboard/AgentPerformanceWidget.tsx

import {
  AlertTriangle,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import type {
  AgentPerformanceItem,
  AgentPerformanceWidgetData,
  DashboardWidget,
} from "../../features/dashboard/dashboard.types";

interface AgentPerformanceWidgetProps {
  widget:
    DashboardWidget<AgentPerformanceWidgetData>;
}

export default function AgentPerformanceWidget({
  widget,
}: AgentPerformanceWidgetProps) {
  return (
    <section className="overflow-hidden rounded-panel border border-corporate-border bg-white shadow-card">
      <div className="border-b border-corporate-border px-6 py-5">
        <h2 className="text-base font-extrabold text-navy-900">
          {widget.title}
        </h2>

        <p className="mt-1 text-xs text-corporate-muted">
          Current workload and
          tickets resolved during
          the last 30 days.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-50/60 text-left">
              <th className="px-6 py-3 text-[10px] font-extrabold uppercase text-navy-400">
                Agent
              </th>

              <th className="px-6 py-3 text-[10px] font-extrabold uppercase text-navy-400">
                Active
              </th>

              <th className="px-6 py-3 text-[10px] font-extrabold uppercase text-navy-400">
                Resolved 30d
              </th>

              <th className="px-6 py-3 text-[10px] font-extrabold uppercase text-navy-400">
                Overdue
              </th>
            </tr>
          </thead>

          <tbody>
            {widget.data.agents.map(
              (
                agent:
                  AgentPerformanceItem,
              ) => (
                <tr
                  key={
                    agent.id
                  }
                  className="border-t border-corporate-border"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                        <UserRound
                          size={
                            15
                          }
                        />
                      </div>

                      <div>
                        <div className="text-xs font-extrabold text-navy-900">
                          {
                            agent.name
                          }
                        </div>

                        <div className="mt-1 text-[10px] text-navy-400">
                          {
                            agent.email
                          }
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm font-extrabold text-navy-800">
                    {
                      agent.activeAssigned
                    }
                  </td>

                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-700">
                      <CheckCircle2
                        size={
                          14
                        }
                      />

                      {
                        agent.resolvedLast30Days
                      }
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        text-sm
                        font-extrabold

                        ${
                          agent.overdue >
                          0
                            ? "text-red-600"
                            : "text-navy-500"
                        }
                      `}
                    >
                      <AlertTriangle
                        size={
                          14
                        }
                      />

                      {
                        agent.overdue
                      }
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}