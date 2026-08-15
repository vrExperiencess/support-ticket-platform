import {
  Filter,
  Search,
  X,
} from "lucide-react";

import type {
  TicketCatalogItem,
  TicketFilters as TicketFiltersType,
  TicketLookupOption,
} from "../../features/tickets/ticket.types";

interface TicketFiltersProps {
  filters: TicketFiltersType;

  searchValue: string;

  statuses: TicketCatalogItem[];

  priorities: TicketCatalogItem[];

  assignees: TicketLookupOption[];

  canViewAging: boolean;

  canFilterAssignee: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onSearch: () => void;

  onChange: (
    changes: Partial<TicketFiltersType>,
  ) => void;

  onClear: () => void;
}

export default function TicketFilters({
  filters,
  searchValue,
  statuses,
  priorities,
  assignees,
  canViewAging,
  canFilterAssignee,
  onSearchChange,
  onSearch,
  onChange,
  onClear,
}: TicketFiltersProps) {
  return (
    <section className="rounded-panel border border-corporate-border bg-white p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
          />

          <input
            value={
              searchValue
            }
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                onSearch();
              }
            }}
            placeholder="Search by title, description or client..."
            className="h-11 w-full rounded-xl border border-corporate-border bg-white pl-10 pr-4 text-xs text-navy-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={
              filters.status ??
              ""
            }
            onChange={(event) =>
              onChange({
                status:
                  event.target
                    .value
                    ? (event.target
                        .value as TicketFiltersType["status"])
                    : undefined,
              })
            }
            className="h-11 rounded-xl border border-corporate-border bg-white px-3 text-xs font-semibold text-navy-700 outline-none"
          >
            <option value="">
              All statuses
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={
                    status.id
                  }
                  value={
                    status.code
                  }
                >
                  {status.name}
                </option>
              ),
            )}
          </select>

          <select
            value={
              filters.priority ??
              ""
            }
            onChange={(event) =>
              onChange({
                priority:
                  event.target
                    .value
                    ? (event.target
                        .value as TicketFiltersType["priority"])
                    : undefined,
              })
            }
            className="h-11 rounded-xl border border-corporate-border bg-white px-3 text-xs font-semibold text-navy-700 outline-none"
          >
            <option value="">
              All priorities
            </option>

            {priorities.map(
              (priority) => (
                <option
                  key={
                    priority.id
                  }
                  value={
                    priority.code
                  }
                >
                  {priority.name}
                </option>
              ),
            )}
          </select>

          {canFilterAssignee && (
            <select
              value={
                filters.assignedToUserId ??
                ""
              }
              onChange={(event) =>
                onChange({
                  assignedToUserId:
                    event.target
                      .value ||
                    undefined,
                })
              }
              className="h-11 rounded-xl border border-corporate-border bg-white px-3 text-xs font-semibold text-navy-700 outline-none"
            >
              <option value="">
                All agents
              </option>

              {assignees.map(
                (agent) => (
                  <option
                    key={
                      agent.id
                    }
                    value={
                      agent.id
                    }
                  >
                    {agent.name}
                  </option>
                ),
              )}
            </select>
          )}

          {canViewAging && (
            <>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    overdue:
                      !filters.overdue,
                  })
                }
                className={`
                  h-11
                  rounded-xl
                  border
                  px-3
                  text-xs
                  font-bold
                  transition
                  ${
                    filters.overdue
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-corporate-border text-navy-600 hover:bg-navy-50"
                  }
                `}
              >
                Overdue
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    stale:
                      !filters.stale,
                  })
                }
                className={`
                  h-11
                  rounded-xl
                  border
                  px-3
                  text-xs
                  font-bold
                  transition
                  ${
                    filters.stale
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-corporate-border text-navy-600 hover:bg-navy-50"
                  }
                `}
              >
                Stale &gt;48h
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="flex h-11 items-center gap-2 rounded-xl bg-navy-900 px-4 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            <Filter size={15} />

            Apply
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-corporate-border text-navy-400 transition hover:bg-navy-50 hover:text-navy-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}