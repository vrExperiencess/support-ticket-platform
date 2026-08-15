import {
  Bell,
  ChevronDown,
} from "lucide-react";

import {
  Outlet,
} from "react-router-dom";

import {
  useState,
} from "react";

import AppSidebar from "./AppSidebar";

import {
  useAuth,
} from "../../features/auth/useAuth";

export default function AppShell() {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false);

  const {
    user,
  } =
    useAuth();

  return (
    <div className="min-h-screen bg-corporate-background">
      <AppSidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={() =>
          setSidebarCollapsed(
            (value) => !value,
          )
        }
      />

      <div
        className={`
          min-h-screen
          transition-[margin]
          duration-300
          ${
            sidebarCollapsed
              ? "ml-[82px]"
              : "ml-[260px]"
          }
        `}
      >
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-corporate-border bg-white/95 px-8 backdrop-blur">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-400">
              Support operations
            </div>

            <div className="mt-1 text-sm font-bold text-navy-900">
              Service Management
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-corporate-border text-navy-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600">
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
            </button>

            <button className="flex items-center gap-3 rounded-xl border border-corporate-border bg-white px-3 py-2 transition hover:border-navy-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white">
                {user?.name
                  ?.substring(0, 2)
                  .toUpperCase()}
              </div>

              <div className="hidden text-left md:block">
                <div className="max-w-[160px] truncate text-xs font-bold text-navy-900">
                  {user?.name}
                </div>

                <div className="mt-0.5 text-[10px] text-navy-400">
                  {user?.role.name}
                </div>
              </div>

              <ChevronDown
                size={15}
                className="text-navy-400"
              />
            </button>
          </div>
        </header>

        <main className="p-8">
          <div className="mx-auto max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}