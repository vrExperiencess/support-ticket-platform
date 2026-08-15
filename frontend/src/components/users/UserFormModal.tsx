import {
  Save,
  UserPlus,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import type {
  RoleOption,
  UserFormPayload,
  UserListItem,
} from "../../features/users/user.types";

interface UserFormModalProps {
  open:
    boolean;

  mode:
    | "create"
    | "edit";

  user?:
    UserListItem | null;

  roles:
    RoleOption[];

  currentUserId?:
    string;

  submitting:
    boolean;

  error?:
    string | null;

  onClose:
    () => void;

  onSubmit:
    (
      payload:
        UserFormPayload,
    ) => Promise<void>;
}

export default function UserFormModal({
  open,
  mode,
  user,
  roles,
  currentUserId,
  submitting,
  error,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    roleId,
    setRoleId,
  ] =
    useState("");

  const [
    isActive,
    setIsActive,
  ] =
    useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      mode ===
        "edit" &&
      user
    ) {
      setName(
        user.name,
      );

      setEmail(
        user.email,
      );

      setRoleId(
        user.role.id,
      );

      setIsActive(
        user.isActive,
      );

      setPassword(
        "",
      );
    } else {
      setName(
        "",
      );

      setEmail(
        "",
      );

      setPassword(
        "",
      );

      setRoleId(
        roles[0]?.id ??
          "",
      );

      setIsActive(
        true,
      );
    }
  }, [
    open,
    mode,
    user,
    roles,
  ]);

  if (!open) {
    return null;
  }

  const editingSelf =
    mode === "edit" &&
    user?.id ===
      currentUserId;

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await onSubmit({
      name:
        name.trim(),

      email:
        email
          .trim()
          .toLowerCase(),

      ...(mode ===
      "create"
        ? {
            password,
          }
        : {}),

      roleId,

      isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-navy-950/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-panel bg-white shadow-floating">
        <div className="flex items-start justify-between border-b border-corporate-border px-6 py-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <UserPlus
                size={
                  18
                }
              />
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-navy-900">
              {mode ===
              "create"
                ? "Create user"
                : "Edit user"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-corporate-muted">
              {mode ===
              "create"
                ? "Create a new user and assign its initial application role."
                : "Update account information, role or account status."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 transition hover:bg-navy-50 hover:text-navy-900"
          >
            <X
              size={
                18
              }
            />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold text-navy-700">
              Full name *
            </label>

            <input
              required
              minLength={
                2
              }
              maxLength={
                150
              }
              value={
                name
              }
              onChange={(
                event:
                  ChangeEvent<HTMLInputElement>,
              ) =>
                setName(
                  event
                    .target
                    .value,
                )
              }
              className="h-12 w-full rounded-xl border border-corporate-border px-4 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-navy-700">
              Email *
            </label>

            <input
              required
              type="email"
              value={
                email
              }
              onChange={(
                event:
                  ChangeEvent<HTMLInputElement>,
              ) =>
                setEmail(
                  event
                    .target
                    .value,
                )
              }
              className="h-12 w-full rounded-xl border border-corporate-border px-4 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          {mode ===
            "create" && (
            <div>
              <label className="mb-2 block text-xs font-bold text-navy-700">
                Initial
                password *
              </label>

              <input
                required
                type="password"
                minLength={
                  8
                }
                maxLength={
                  72
                }
                value={
                  password
                }
                onChange={(
                  event:
                    ChangeEvent<HTMLInputElement>,
                ) =>
                  setPassword(
                    event
                      .target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-corporate-border px-4 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />

              <p className="mt-2 text-[10px] text-navy-400">
                Minimum 8
                characters with
                uppercase,
                lowercase and a
                number.
              </p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-navy-700">
                Role *
              </label>

              <select
                required
                disabled={
                  editingSelf
                }
                value={
                  roleId
                }
                onChange={(
                  event:
                    ChangeEvent<HTMLSelectElement>,
                ) =>
                  setRoleId(
                    event
                      .target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-corporate-border bg-white px-3 text-sm text-navy-900 disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400"
              >
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
                        role.id
                      }
                    >
                      {
                        role.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-navy-700">
                Account
                status
              </label>

              <label
                className={`
                  flex
                  h-12
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-corporate-border
                  px-4

                  ${
                    editingSelf
                      ? "cursor-not-allowed bg-navy-50"
                      : "cursor-pointer bg-white"
                  }
                `}
              >
                <input
                  type="checkbox"
                  disabled={
                    editingSelf
                  }
                  checked={
                    isActive
                  }
                  onChange={(
                    event:
                      ChangeEvent<HTMLInputElement>,
                  ) =>
                    setIsActive(
                      event
                        .target
                        .checked,
                    )
                  }
                />

                <span className="text-xs font-bold text-navy-700">
                  Active
                  user
                </span>
              </label>
            </div>
          </div>

          {editingSelf && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] leading-5 text-blue-700">
              Your own role
              and account
              status cannot be
              modified from
              this screen.
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-corporate-border pt-5">
            <button
              type="button"
              onClick={
                onClose
              }
              className="h-11 rounded-xl border border-corporate-border px-5 text-xs font-bold text-navy-600"
            >
              Cancel
            </button>

            <button
              disabled={
                submitting ||
                !roleId
              }
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-xs font-extrabold text-white shadow-orange disabled:opacity-50"
            >
              <Save
                size={
                  15
                }
              />

              {submitting
                ? "Saving..."
                : mode ===
                    "create"
                  ? "Create user"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}