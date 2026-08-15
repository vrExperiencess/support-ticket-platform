// src/pages/DashboardPage.tsx

import {
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import DashboardRenderer from "../components/dashboard/DashboardRenderer";

import {
  useAuth,
} from "../features/auth/useAuth";

import type {
  DashboardResponse,
} from "../features/dashboard/dashboard.types";

import {
  dashboardService,
} from "../services/dashboard.service";

function formatGeneratedAt(
  value: string,
): string {
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

export default function DashboardPage() {
  const {
    user,
  } =
    useAuth();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardResponse | null>(
      null,
    );

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

  const loadDashboard =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);

        setError(null);

        try {
          const response =
            await dashboardService.getDashboard();

          setDashboard(
            response,
          );
        } catch (
          requestError: unknown
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load dashboard.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadDashboard();
  }, [
    loadDashboard,
  ]);

  if (
    loading &&
    !dashboard
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />

          <span className="text-xs font-semibold text-navy-400">
            Loading operational
            dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            Operational dashboard
          </span>

          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-navy-900">
            Welcome back,{" "}
            {
              user?.name.split(
                " ",
              )[0]
            }
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-corporate-muted">
            Your dashboard is
            automatically configured
            according to your current
            role and permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dashboard && (
            <div className="hidden text-right md:block">
              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-navy-300">
                Last updated
              </div>

              <div className="mt-1 text-[10px] font-semibold text-navy-500">
                {formatGeneratedAt(
                  dashboard.generatedAt,
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              void loadDashboard()
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-corporate-border bg-white px-4 text-xs font-bold text-navy-600 transition hover:bg-navy-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ROLE INFO */}

      <div className="mt-7 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
          <ShieldCheck
            size={17}
          />
        </div>

        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-600">
            Active workspace
          </div>

          <div className="mt-0.5 text-xs font-extrabold text-navy-900">
            {dashboard?.role.name ??
              user?.role.name}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* DYNAMIC DASHBOARD */}

      <div className="mt-6">
        {dashboard &&
        dashboard.widgets.length >
          0 ? (
          <DashboardRenderer
            widgets={
              dashboard.widgets
            }
          />
        ) : (
          !loading && (
            <div className="rounded-panel border border-dashed border-navy-200 bg-white p-12 text-center">
              <h2 className="text-sm font-extrabold text-navy-900">
                No dashboard widgets
                available
              </h2>

              <p className="mt-2 text-xs text-corporate-muted">
                No widgets are
                currently enabled for
                this role.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}