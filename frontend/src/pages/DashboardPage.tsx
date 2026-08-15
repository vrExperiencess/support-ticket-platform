import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import {
  navigationRoutes,
} from "../routes/routeConfig";

import {
  useAuth,
} from "../features/auth/useAuth";

export default function DashboardPage() {
  const {
    user,
    hasPermission,
  } =
    useAuth();

  const availableModules =
    navigationRoutes.filter(
      (route) =>
        !route.permission ||
        hasPermission(
          route.permission,
        ),
    );

  const cards = [
    {
      title:
        "Open tickets",
      value: "—",
      subtitle:
        "Waiting for dashboard endpoint",
      icon: Ticket,
    },

    {
      title:
        "Critical priority",
      value: "—",
      subtitle:
        "Operational attention",
      icon:
        AlertTriangle,
    },

    {
      title:
        "Stale tickets",
      value: "—",
      subtitle:
        "No updates > 48h",
      icon: Activity,
    },

    {
      title:
        "Role permissions",
      value:
        user?.permissions
          .length ?? 0,
      subtitle:
        user?.role.name ??
        "",
      icon: ShieldCheck,
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            Dashboard
          </span>

          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-navy-900">
            Welcome back,
            {" "}
            {
              user?.name.split(
                " ",
              )[0]
            }
          </h1>

          <p className="mt-2 text-sm text-corporate-muted">
            Here is your
            operational workspace
            based on your assigned
            role and permissions.
          </p>
        </div>

        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">
            Active role
          </div>

          <div className="mt-1 text-sm font-extrabold text-navy-900">
            {user?.role.name}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <article
                key={
                  card.title
                }
                className="rounded-panel border border-corporate-border bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                    <Icon
                      size={19}
                    />
                  </div>

                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                </div>

                <div className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-navy-900">
                  {card.value}
                </div>

                <div className="mt-2 text-xs font-bold text-navy-800">
                  {
                    card.title
                  }
                </div>

                <div className="mt-1 text-[11px] text-corporate-muted">
                  {
                    card.subtitle
                  }
                </div>
              </article>
            );
          },
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
          <div>
            <h2 className="text-base font-extrabold text-navy-900">
              Available modules
            </h2>

            <p className="mt-1 text-xs text-corporate-muted">
              Navigation is
              generated dynamically
              from your current
              permissions.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {availableModules.map(
              (route) => {
                const Icon =
                  route.icon;

                return (
                  <div
                    key={
                      route.id
                    }
                    className="flex items-center gap-4 rounded-xl border border-corporate-border p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon
                        size={18}
                      />
                    </div>

                    <div>
                      <div className="text-xs font-extrabold text-navy-900">
                        {
                          route.label
                        }
                      </div>

                      <div className="mt-1 text-[10px] text-corporate-muted">
                        {
                          route.description
                        }
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section className="rounded-panel bg-auth-gradient p-6 text-white shadow-panel">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white shadow-orange">
            <ShieldCheck
              size={21}
            />
          </div>

          <h2 className="mt-5 text-lg font-extrabold">
            Access control
          </h2>

          <p className="mt-2 text-xs leading-5 text-navy-200">
            Your interface is
            configured according
            to the permissions
            assigned to your role.
          </p>

          <div className="mt-5 space-y-2">
            {user?.permissions
              .slice(0, 6)
              .map(
                (
                  permission,
                ) => (
                  <div
                    key={
                      permission
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-medium text-navy-100"
                  >
                    {permission}
                  </div>
                ),
              )}

            {(user?.permissions
              .length ?? 0) >
              6 && (
              <div className="pt-1 text-[10px] font-semibold text-brand-300">
                +
                {(user
                  ?.permissions
                  .length ??
                  0) -
                  6}{" "}
                additional
                permissions
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}