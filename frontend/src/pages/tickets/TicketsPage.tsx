import {
  Plus,
  RefreshCw,
  Ticket,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import TicketFilters from "../../components/tickets/TicketFilters";
import TicketTable from "../../components/tickets/TicketTable";

import {
  useAuth,
} from "../../features/auth/useAuth";

import {
  useTicketPermissions,
} from "../../features/tickets/useTicketPermissions";

import type {
  PaginatedTicketsResponse,
  TicketCatalogItem,
  TicketFilters as TicketFiltersType,
  TicketLookupOption,
} from "../../features/tickets/ticket.types";

import {
  ticketsService,
} from "../../services/tickets.service";

const INITIAL_FILTERS:
  TicketFiltersType = {
  page: 1,

  limit: 10,

  sortBy:
    "createdAt",

  sortOrder:
    "DESC",
};

export default function TicketsPage() {
  const navigate =
    useNavigate();

  const {
    hasPermission,
  } =
    useAuth();

  const {
    canCreate,
    canViewAging,
  } =
    useTicketPermissions();

  const [
    ticketsResponse,
    setTicketsResponse,
  ] =
    useState<PaginatedTicketsResponse>({
      data: [],

      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

  const [
    statuses,
    setStatuses,
  ] =
    useState<TicketCatalogItem[]>([]);

  const [
    priorities,
    setPriorities,
  ] =
    useState<TicketCatalogItem[]>([]);

  const [
    assignees,
    setAssignees,
  ] =
    useState<TicketLookupOption[]>([]);

  const [
    filters,
    setFilters,
  ] =
    useState<TicketFiltersType>(
      INITIAL_FILTERS,
    );

  const [
    searchValue,
    setSearchValue,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /**
   * Los agentes asignables solo pueden consultarse si
   * el usuario puede asignar o reasignar.
   */
  const canLoadAssignees =
    hasPermission(
      "tickets.assign",
    ) ||
    hasPermission(
      "tickets.reassign",
    );

  const canFilterAssignee =
    hasPermission(
      "tickets.read.all",
    ) &&
    canLoadAssignees;

  const loadTickets =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await ticketsService.getTickets(
              filters,
            );

          setTicketsResponse(
            response,
          );
        } catch (requestError) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load tickets.",
          );
        } finally {
          setLoading(false);
        }
      },
      [filters],
    );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [
          statusData,
          priorityData,
        ] =
          await Promise.all([
            ticketsService.getStatuses(),
            ticketsService.getPriorities(),
          ]);

        setStatuses(
          statusData,
        );

        setPriorities(
          priorityData,
        );

        if (
          canLoadAssignees
        ) {
          const agents =
            await ticketsService.getAssignees();

          setAssignees(
            agents,
          );
        }
      } catch (requestError) {
        console.error(
          "Unable to load ticket catalogs",
          requestError,
        );
      }
    }

    void loadCatalogs();
  }, [canLoadAssignees]);

  function updateFilters(
    changes: Partial<TicketFiltersType>,
  ) {
    setFilters(
      (current) => ({
        ...current,
        ...changes,

        /*
         * Cualquier cambio de filtro vuelve
         * automáticamente a página 1.
         */
        page:
          changes.page ??
          1,
      }),
    );
  }

  function applySearch() {
    updateFilters({
      search:
        searchValue.trim() ||
        undefined,
    });
  }

  function clearFilters() {
    setSearchValue("");

    setFilters(
      INITIAL_FILTERS,
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            Ticket management
          </span>

          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-navy-900">
            Support tickets
          </h1>

          <p className="mt-2 text-sm text-corporate-muted">
            Consult, filter and
            operate support requests
            according to your
            permissions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void loadTickets()
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-corporate-border bg-white px-4 text-xs font-bold text-navy-600 transition hover:bg-navy-50"
          >
            <RefreshCw
              size={15}
            />

            Refresh
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/tickets/new",
                )
              }
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-extrabold text-white shadow-orange transition hover:bg-brand-600"
            >
              <Plus
                size={16}
              />

              Create ticket
            </button>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
            <Ticket
              size={18}
            />
          </div>

          <div className="mt-4 text-2xl font-extrabold text-navy-900">
            {
              ticketsResponse
                .meta.total
            }
          </div>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-navy-400">
            Matching tickets
          </p>
        </div>

        <div className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
          <div className="text-2xl font-extrabold text-navy-900">
            {
              ticketsResponse
                .meta.page
            }
          </div>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-navy-400">
            Current page
          </p>
        </div>

        <div className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
          <div className="text-2xl font-extrabold text-navy-900">
            {
              ticketsResponse
                .meta.totalPages
            }
          </div>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-navy-400">
            Total pages
          </p>
        </div>
      </div>

      <div className="mt-5">
        <TicketFilters
          filters={
            filters
          }
          searchValue={
            searchValue
          }
          statuses={
            statuses
          }
          priorities={
            priorities
          }
          assignees={
            assignees
          }
          canViewAging={
            canViewAging
          }
          canFilterAssignee={
            canFilterAssignee
          }
          onSearchChange={
            setSearchValue
          }
          onSearch={
            applySearch
          }
          onChange={
            updateFilters
          }
          onClear={
            clearFilters
          }
        />
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5">
        <TicketTable
          tickets={
            ticketsResponse.data
          }
          loading={
            loading
          }
          onSelect={(ticket) =>
            navigate(
              `/tickets/${ticket.id}`,
            )
          }
        />
      </div>

      {ticketsResponse.meta
        .totalPages >
        1 && (
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-navy-400">
            Page{" "}
            {
              ticketsResponse
                .meta.page
            }{" "}
            of{" "}
            {
              ticketsResponse
                .meta.totalPages
            }
          </div>

          <div className="flex gap-2">
            <button
              disabled={
                filters.page <=
                1
              }
              onClick={() =>
                updateFilters({
                  page:
                    filters.page -
                    1,
                })
              }
              className="h-10 rounded-xl border border-corporate-border bg-white px-4 text-xs font-bold text-navy-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={
                filters.page >=
                ticketsResponse
                  .meta
                  .totalPages
              }
              onClick={() =>
                updateFilters({
                  page:
                    filters.page +
                    1,
                })
              }
              className="h-10 rounded-xl border border-corporate-border bg-white px-4 text-xs font-bold text-navy-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}