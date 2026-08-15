import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import BrandMark from "../branding/BrandMark";

import {
  navigationRoutes,
} from "../../routes/routeConfig";

import {
  useAuth,
} from "../../features/auth/useAuth";

interface AppSidebarProps {
  collapsed: boolean;

  onToggle: () => void;
}

export default function AppSidebar({
  collapsed,
  onToggle,
}: AppSidebarProps) {
  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  const availableRoutes =
    navigationRoutes.filter(
      (route) =>
        !route.permission ||
        hasPermission(
          route.permission,
        ),
    );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        flex flex-col
        border-r border-white/5
        bg-navy-950
        text-white
        transition-all duration-300
        ${
          collapsed
            ? "w-[82px]"
            : "w-[260px]"
        }
      `}
    >
      <div
        className={`
          flex h-[76px]
          items-center
          border-b border-white/5
          ${
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5"
          }
        `}
      >
        <BrandMark
          compact={collapsed}
          light
        />

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-200 transition hover:bg-white/5 hover:text-white"
          >
            <PanelLeftClose
              size={18}
            />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-lg text-navy-300 transition hover:bg-white/5 hover:text-white"
        >
          <PanelLeftOpen
            size={18}
          />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">
            Workspace
          </p>
        )}

        <div className="space-y-1">
          {availableRoutes.map(
            (route) => {
              const Icon =
                route.icon;

              return (
                <NavLink
                  key={route.id}
                  to={route.path}
                  end={route.end}
                  className={({
                    isActive,
                  }) =>
                    `
                      group relative
                      flex min-h-[48px]
                      items-center
                      rounded-xl
                      transition-all
                      duration-200

                      ${
                        collapsed
                          ? "justify-center px-2"
                          : "gap-3 px-3.5"
                      }

                      ${
                        isActive
                          ? "bg-brand-500 text-white shadow-orange"
                          : "text-navy-200 hover:bg-white/5 hover:text-white"
                      }
                    `
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      <Icon
                        size={19}
                        strokeWidth={
                          isActive
                            ? 2.25
                            : 1.8
                        }
                      />

                      {!collapsed && (
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold">
                            {
                              route.label
                            }
                          </div>

                          {route.description && (
                            <div
                              className={`
                                mt-0.5
                                truncate
                                text-[10px]
                                ${
                                  isActive
                                    ? "text-white/75"
                                    : "text-navy-400"
                                }
                              `}
                            >
                              {
                                route.description
                              }
                            </div>
                          )}
                        </div>
                      )}

                      {collapsed && (
                        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-navy-800 px-3 py-2 text-xs font-medium text-white shadow-floating group-hover:block">
                          {
                            route.label
                          }
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            },
          )}
        </div>
      </nav>

      <div className="border-t border-white/5 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-white/[0.04] p-3.5">
            <div className="truncate text-xs font-semibold text-white">
              {user?.name}
            </div>

            <div className="mt-1 truncate text-[10px] text-navy-300">
              {
                user?.role.name
              }
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className={`
            flex h-11 w-full items-center
            rounded-xl
            text-navy-300
            transition
            hover:bg-red-500/10
            hover:text-red-300

            ${
              collapsed
                ? "justify-center"
                : "gap-3 px-3"
            }
          `}
        >
          <LogOut size={18} />

          {!collapsed && (
            <span className="text-xs font-semibold">
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}