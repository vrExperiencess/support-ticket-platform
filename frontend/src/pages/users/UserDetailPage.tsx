import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import UserFormModal from "../../components/users/UserFormModal";
import UserRoleBadge from "../../components/users/UserRoleBadge";
import UserStatusBadge from "../../components/users/UserStatusBadge";

import MetricCard from "../../components/dashboard/MetricCard";

import {
  useAuth,
} from "../../features/auth/useAuth";

import type {
  RoleOption,
  UserDetail,
  UserFormPayload,
} from "../../features/users/user.types";

import {
  usersService,
} from "../../services/users.service";

function formatDate(
  value:
    string,
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
    new Date(
      value,
    ),
  );
}

export default function UserDetailPage() {
  const {
    id,
  } =
    useParams<{
      id:
        string;
    }>();

  const navigate =
    useNavigate();

  const {
    user:
      authenticatedUser,
    hasPermission,
  } =
    useAuth();

  const [
    user,
    setUser,
  ] =
    useState<UserDetail | null>(
      null,
    );

  const [
    roles,
    setRoles,
  ] =
    useState<RoleOption[]>(
      [],
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

  const [
    editOpen,
    setEditOpen,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    editError,
    setEditError,
  ] =
    useState<string | null>(
      null,
    );

  const canUpdate =
    hasPermission(
      "users.update",
    );

  const loadUser =
    useCallback(
      async (): Promise<void> => {
        if (!id) {
          return;
        }

        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const data =
            await usersService.getUser(
              id,
            );

          setUser(
            data,
          );
        } catch (
          requestError:
            unknown
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load user.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        id,
      ],
    );

  useEffect(() => {
    void loadUser();
  }, [
    loadUser,
  ]);

  useEffect(() => {
    if (
      !canUpdate
    ) {
      return;
    }

    void usersService
      .getRoles()
      .then(
        (
          data:
            RoleOption[],
        ) => {
          setRoles(
            data,
          );
        },
      )
      .catch(
        (
          requestError:
            unknown,
        ) => {
          console.error(
            requestError,
          );
        },
      );
  }, [
    canUpdate,
  ]);

  async function handleUpdate(
    payload:
      UserFormPayload,
  ): Promise<void> {
    if (!user) {
      return;
    }

    setSubmitting(
      true,
    );

    setEditError(
      null,
    );

    try {
      const updated =
        await usersService.updateUser(
          user.id,
          {
            name:
              payload.name,

            email:
              payload.email,

            roleId:
              payload.roleId,

            isActive:
              payload.isActive,
          },
        );

      setUser(
        updated,
      );

      setEditOpen(
        false,
      );
    } catch (
      requestError:
        unknown
    ) {
      setEditError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to update user.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-panel border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
        {error ??
          "User not found."}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          navigate(
            "/users",
          )
        }
        className="mb-5 flex items-center gap-2 text-xs font-bold text-navy-500"
      >
        <ArrowLeft
          size={
            15
          }
        />

        Back to users
      </button>

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white">
              <UserRound
                size={
                  23
                }
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <UserRoleBadge
                  code={
                    user
                      .role
                      .code
                  }
                  name={
                    user
                      .role
                      .name
                  }
                />

                <UserStatusBadge
                  active={
                    user.isActive
                  }
                />
              </div>

              <h1 className="mt-3 text-2xl font-extrabold text-navy-900">
                {
                  user.name
                }
              </h1>

              <p className="mt-1 text-sm text-corporate-muted">
                {
                  user.email
                }
              </p>
            </div>
          </div>

          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setEditError(
                  null,
                );

                setEditOpen(
                  true,
                );
              }}
              className="flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white"
            >
              <Edit3
                size={
                  14
                }
              />

              Edit user
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-corporate-border pt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase text-navy-400">
                Created
              </div>

              <div className="mt-1 text-xs font-semibold text-navy-700">
                {formatDate(
                  user.createdAt,
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-navy-400">
                Last updated
              </div>

              <div className="mt-1 text-xs font-semibold text-navy-700">
                {formatDate(
                  user.updatedAt,
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <h2 className="mb-4 text-sm font-extrabold text-navy-900">
          Operational
          activity
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active assigned"
            value={
              user.stats
                .activeAssignedTickets
            }
            description="Open and in-progress tickets"
            icon={
              Ticket
            }
          />

          <MetricCard
            label="Resolved 30d"
            value={
              user.stats
                .resolvedLast30Days
            }
            description="Tickets resolved in the last 30 days"
            icon={
              CheckCircle2
            }
          />

          <MetricCard
            label="Overdue"
            value={
              user.stats
                .overdueAssignedTickets
            }
            description="Currently overdue assignments"
            icon={
              AlertTriangle
            }
            alert={
              user.stats
                .overdueAssignedTickets >
              0
            }
          />

          <MetricCard
            label="Created tickets"
            value={
              user.stats
                .createdTickets
            }
            description="Tickets created by this user"
            icon={
              UserRound
            }
          />
        </div>
      </div>

      <UserFormModal
        open={
          editOpen
        }
        mode="edit"
        user={
          user
        }
        roles={
          roles
        }
        currentUserId={
          authenticatedUser?.id
        }
        submitting={
          submitting
        }
        error={
          editError
        }
        onClose={() =>
          setEditOpen(
            false,
          )
        }
        onSubmit={
          handleUpdate
        }
      />
    </div>
  );
}