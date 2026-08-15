import {
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  KeyboardEvent,
MouseEvent
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import UserFormModal from "../../components/users/UserFormModal";
import UserRoleBadge from "../../components/users/UserRoleBadge";
import UserStatusBadge from "../../components/users/UserStatusBadge";

import {
  useAuth,
} from "../../features/auth/useAuth";

import type {
  PaginatedUsersResponse,
  RoleOption,
  UserFilters,
  UserFormPayload,
  UserListItem,
} from "../../features/users/user.types";

import {
  usersService,
} from "../../services/users.service";

const INITIAL_FILTERS:
  UserFilters = {
  page:
    1,

  limit:
    10,

  sortBy:
    "name",

  sortOrder:
    "ASC",
};

function formatDate(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle:
        "medium",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

export default function UsersPage() {
  const navigate =
    useNavigate();

  const {
    user:
      authenticatedUser,
    hasPermission,
  } =
    useAuth();

  const [
    response,
    setResponse,
  ] =
    useState<PaginatedUsersResponse>({
      data:
        [],

      meta: {
        page:
          1,

        limit:
          10,

        total:
          0,

        totalPages:
          0,
      },
    });

  const [
    roles,
    setRoles,
  ] =
    useState<RoleOption[]>(
      [],
    );

  const [
    filters,
    setFilters,
  ] =
    useState<UserFilters>(
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
    pageError,
    setPageError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] =
    useState<UserListItem | null>(
      null,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    modalError,
    setModalError,
  ] =
    useState<string | null>(
      null,
    );

  const canCreate =
    hasPermission(
      "users.create",
    );

  const canUpdate =
    hasPermission(
      "users.update",
    );

  const loadUsers =
    useCallback(
      async (): Promise<void> => {
        setLoading(
          true,
        );

        setPageError(
          null,
        );

        try {
          const data =
            await usersService.getUsers(
              filters,
            );

          setResponse(
            data,
          );
        } catch (
          error:
            unknown
        ) {
          setPageError(
            error instanceof
              Error
              ? error.message
              : "Unable to load users.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        filters,
      ],
    );

  useEffect(() => {
    void loadUsers();
  }, [
    loadUsers,
  ]);

  useEffect(() => {
    async function loadRoles(): Promise<void> {
      try {
        const data =
          await usersService.getRoles();

        setRoles(
          data,
        );
      } catch (
        error:
          unknown
      ) {
        console.error(
          "Unable to load roles",
          error,
        );
      }
    }

    void loadRoles();
  }, []);

  function updateFilters(
    changes:
      Partial<UserFilters>,
  ): void {
    setFilters(
      (
        current:
          UserFilters,
      ) => ({
        ...current,
        ...changes,

        page:
          changes.page ??
          1,
      }),
    );
  }

  function applySearch(): void {
    updateFilters({
      search:
        searchValue.trim() ||
        undefined,
    });
  }

  function openCreate(): void {
    setSelectedUser(
      null,
    );

    setModalError(
      null,
    );

    setModalOpen(
      true,
    );
  }

  function openEdit(
    user:
      UserListItem,
  ): void {
    setSelectedUser(
      user,
    );

    setModalError(
      null,
    );

    setModalOpen(
      true,
    );
  }

  async function handleSubmit(
    payload:
      UserFormPayload,
  ): Promise<void> {
    setSubmitting(
      true,
    );

    setModalError(
      null,
    );

    try {
      if (
        selectedUser
      ) {
        await usersService.updateUser(
          selectedUser.id,
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
      } else {
        if (
          !payload.password
        ) {
          setModalError(
            "Password is required.",
          );

          return;
        }

        await usersService.createUser({
          name:
            payload.name,

          email:
            payload.email,

          password:
            payload.password,

          roleId:
            payload.roleId,

          isActive:
            payload.isActive,
        });
      }

      setModalOpen(
        false,
      );

      setSelectedUser(
        null,
      );

      await loadUsers();
    } catch (
      error:
        unknown
    ) {
      setModalError(
        error instanceof
          Error
          ? error.message
          : "Unable to save user.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            Administration
          </span>

          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-navy-900">
            Users
          </h1>

          <p className="mt-2 text-sm text-corporate-muted">
            Manage
            application
            accounts, roles
            and access
            status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void loadUsers()
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-corporate-border bg-white px-4 text-xs font-bold text-navy-600"
          >
            <RefreshCw
              size={
                15
              }
            />

            Refresh
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-extrabold text-white shadow-orange"
            >
              <Plus
                size={
                  16
                }
              />

              Create user
            </button>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
          <Users
            size={
              19
            }
            className="text-brand-600"
          />

          <div className="mt-4 text-2xl font-extrabold text-navy-900">
            {
              response
                .meta
                .total
            }
          </div>

          <p className="mt-1 text-[10px] font-bold uppercase text-navy-400">
            Matching users
          </p>
        </div>
      </div>

      <section className="mt-5 rounded-panel border border-corporate-border bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={
                16
              }
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
            />

            <input
              value={
                searchValue
              }
              onChange={(
                event:
                  ChangeEvent<HTMLInputElement>,
              ) =>
                setSearchValue(
                  event
                    .target
                    .value,
                )
              }
              onKeyDown={(
                event:
                  KeyboardEvent<HTMLInputElement>,
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  applySearch();
                }
              }}
              placeholder="Search by name or email..."
              className="h-11 w-full rounded-xl border border-corporate-border pl-10 pr-4 text-xs outline-none focus:border-brand-400"
            />
          </div>

          <select
            value={
              filters.role ??
              ""
            }
            onChange={(
              event:
                ChangeEvent<HTMLSelectElement>,
            ) =>
              updateFilters({
                role:
                  event
                    .target
                    .value ||
                  undefined,
              })
            }
            className="h-11 rounded-xl border border-corporate-border px-3 text-xs font-semibold text-navy-700"
          >
            <option value="">
              All roles
            </option>

            {roles.map(
              (
                role:
                  RoleOption,
              ) => (
                <option
                  key={
                    role.id
                  }
                  value={
                    role.code
                  }
                >
                  {
                    role.name
                  }
                </option>
              ),
            )}
          </select>

          <select
            value={
              filters.isActive ===
              undefined
                ? ""
                : String(
                    filters.isActive,
                  )
            }
            onChange={(
              event:
                ChangeEvent<HTMLSelectElement>,
            ) =>
              updateFilters({
                isActive:
                  event
                    .target
                    .value ===
                  ""
                    ? undefined
                    : event
                          .target
                          .value ===
                        "true",
              })
            }
            className="h-11 rounded-xl border border-corporate-border px-3 text-xs font-semibold text-navy-700"
          >
            <option value="">
              All statuses
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>
          </select>

          <button
            type="button"
            onClick={
              applySearch
            }
            className="h-11 rounded-xl bg-navy-900 px-5 text-xs font-bold text-white"
          >
            Apply
          </button>
        </div>
      </section>

      {pageError && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {
            pageError
          }
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-panel border border-corporate-border bg-white shadow-card">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-navy-400">
            Loading
            users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-50/60 text-left">
                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-navy-400">
                    User
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-navy-400">
                    Role
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-navy-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[10px] font-extrabold uppercase text-navy-400">
                    Created
                  </th>

                  <th className="w-28" />
                </tr>
              </thead>

              <tbody>
                {response.data.map(
                  (
                    item:
                      UserListItem,
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                      onClick={() =>
                        navigate(
                          `/users/${item.id}`,
                        )
                      }
                      className="cursor-pointer border-t border-corporate-border transition hover:bg-brand-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="text-xs font-extrabold text-navy-900">
                          {
                            item.name
                          }
                        </div>

                        <div className="mt-1 text-[10px] text-navy-400">
                          {
                            item.email
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <UserRoleBadge
                          code={
                            item
                              .role
                              .code
                          }
                          name={
                            item
                              .role
                              .name
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <UserStatusBadge
                          active={
                            item.isActive
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-xs text-navy-500">
                        {formatDate(
                          item.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={(
                                event:
                                  MouseEvent<HTMLButtonElement>,
                              ) => {
                                event.stopPropagation();

                                openEdit(
                                  item,
                                );
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-corporate-border text-navy-500 hover:bg-navy-50"
                            >
                              <Edit3
                                size={
                                  13
                                }
                              />
                            </button>
                          )}

                          <ChevronRight
                            size={
                              16
                            }
                            className="mt-2 text-navy-300"
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {response.meta.totalPages >
        1 && (
        <div className="mt-5 flex justify-end gap-2">
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
            className="h-10 rounded-xl border border-corporate-border px-4 text-xs font-bold text-navy-600 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            disabled={
              filters.page >=
              response.meta
                .totalPages
            }
            onClick={() =>
              updateFilters({
                page:
                  filters.page +
                  1,
              })
            }
            className="h-10 rounded-xl border border-corporate-border px-4 text-xs font-bold text-navy-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <UserFormModal
        open={
          modalOpen
        }
        mode={
          selectedUser
            ? "edit"
            : "create"
        }
        user={
          selectedUser
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
          modalError
        }
        onClose={() => {
          setModalOpen(
            false,
          );

          setSelectedUser(
            null,
          );
        }}
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}