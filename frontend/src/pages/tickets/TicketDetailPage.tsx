import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  MessageSquare,
  RefreshCw,
  Save,
  Send,
  Shield,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import TicketModal from "../../components/tickets/TicketModal";
import TicketPriorityBadge from "../../components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "../../components/tickets/TicketStatusBadge";

import {
  useTicketPermissions,
} from "../../features/tickets/useTicketPermissions";

import type {
  TicketCatalogItem,
  TicketDetail,
  TicketLookupOption,
  TicketStatusCode,
} from "../../features/tickets/ticket.types";

import {
  ticketsService,
} from "../../services/tickets.service";

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

/**
 * datetime-local necesita formato:
 *
 * YYYY-MM-DDTHH:mm
 */
function toLocalDateTimeValue(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const localDate =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

type ModalType =
  | "assign"
  | "reassign"
  | "status"
  | "delete"
  | null;

export default function TicketDetailPage() {
  const {
    id,
  } =
    useParams<{
      id: string;
    }>();

  const navigate =
    useNavigate();

  const [
    ticket,
    setTicket,
  ] =
    useState<TicketDetail | null>(
      null,
    );

  const [
    priorities,
    setPriorities,
  ] =
    useState<TicketCatalogItem[]>([]);

  const [
    clients,
    setClients,
  ] =
    useState<TicketLookupOption[]>([]);

  const [
    assignees,
    setAssignees,
  ] =
    useState<TicketLookupOption[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    editMode,
    setEditMode,
  ] =
    useState(false);

  const [
    editTitle,
    setEditTitle,
  ] =
    useState("");

  const [
    editDescription,
    setEditDescription,
  ] =
    useState("");

  const [
    editPriorityId,
    setEditPriorityId,
  ] =
    useState("");

  const [
    editClientId,
    setEditClientId,
  ] =
    useState("");

  const [
    editDueAt,
    setEditDueAt,
  ] =
    useState("");

  const [
    comment,
    setComment,
  ] =
    useState("");

  const [
    internalComment,
    setInternalComment,
  ] =
    useState(false);

  const [
    modal,
    setModal,
  ] =
    useState<ModalType>(
      null,
    );

  const [
    selectedAgent,
    setSelectedAgent,
  ] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<TicketStatusCode | "">(
      "",
    );

  const permissions =
    useTicketPermissions(
      ticket,
    );

  const loadTicket =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const data =
            await ticketsService.getTicket(
              id,
            );

          setTicket(data);

          setEditTitle(
            data.title,
          );

          setEditDescription(
            data.description,
          );

          setEditPriorityId(
            data.priority.id,
          );

          setEditClientId(
            data.client.id,
          );

          setEditDueAt(
            toLocalDateTimeValue(
              data.dueAt,
            ),
          );
        } catch (requestError) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load ticket.",
          );
        } finally {
          setLoading(false);
        }
      },
      [id],
    );

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  /**
   * Catálogos básicos.
   */
  useEffect(() => {
    async function loadCatalogs() {
      try {
        const prioritiesData =
          await ticketsService.getPriorities();

        setPriorities(
          prioritiesData,
        );
      } catch {
        // El detalle sigue siendo utilizable
        // aunque falle un catálogo secundario.
      }
    }

    void loadCatalogs();
  }, []);

  /**
   * Carga condicional de clientes.
   *
   * Solo un usuario con update.any necesita cambiar
   * cliente o fecha límite.
   */
  useEffect(() => {
    if (
      !permissions.canEditAny
    ) {
      return;
    }

    void ticketsService
      .getClients()
      .then(setClients)
      .catch(() => {
        // No bloqueamos la vista.
      });
  }, [
    permissions.canEditAny,
  ]);

  /**
   * Agentes solo son necesarios para assign/reassign.
   */
  useEffect(() => {
    if (
      !permissions.canAssign &&
      !permissions.canReassign
    ) {
      return;
    }

    void ticketsService
      .getAssignees()
      .then(setAssignees)
      .catch(() => {
        // No bloqueamos detalle.
      });
  }, [
    permissions.canAssign,
    permissions.canReassign,
  ]);

  /**
   * Supervisor:
   *
   * tiene internal comment pero no comment normal.
   *
   * En ese caso activamos automáticamente
   * el comentario interno.
   */
  useEffect(() => {
    if (
      permissions.canInternalComment &&
      !permissions.canComment
    ) {
      setInternalComment(
        true,
      );
    }
  }, [
    permissions.canInternalComment,
    permissions.canComment,
  ]);

  const allowedStatuses =
    useMemo(() => {
      if (!ticket) {
        return [];
      }

      const current =
        ticket.status
          .code as TicketStatusCode;

      const transitions: Record<
        TicketStatusCode,
        TicketStatusCode[]
      > = {
        OPEN: [
          "IN_PROGRESS",
          "RESOLVED",
        ],

        IN_PROGRESS: [
          "OPEN",
          "RESOLVED",
        ],

        RESOLVED: [
          "IN_PROGRESS",
        ],

        CLOSED: [],
      };

      return transitions[
        current
      ];
    }, [ticket]);

  async function runAction(
    action:
      () => Promise<TicketDetail>,
  ) {
    setActionLoading(true);
    setError(null);

    try {
      const updated =
        await action();

      setTicket(updated);

      setEditTitle(
        updated.title,
      );

      setEditDescription(
        updated.description,
      );

      setEditPriorityId(
        updated.priority.id,
      );

      setEditClientId(
        updated.client.id,
      );

      setEditDueAt(
        toLocalDateTimeValue(
          updated.dueAt,
        ),
      );

      setModal(null);

      setSelectedAgent("");

      setSelectedStatus("");
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Operation failed.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !ticket
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const updated =
        await ticketsService.updateTicket(
          ticket.id,
          {
            title:
              editTitle.trim(),

            description:
              editDescription.trim(),

            priorityId:
              editPriorityId,

            ...(permissions.canEditAny
              ? {
                  clientId:
                    editClientId,

                  ...(editDueAt
                    ? {
                        dueAt:
                          new Date(
                            editDueAt,
                          ).toISOString(),
                      }
                    : {}),
                }
              : {}),
          },
        );

      setTicket(updated);

      setEditMode(false);
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to update ticket.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function submitComment(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !ticket ||
      !comment.trim()
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await ticketsService.createComment(
        ticket.id,
        comment.trim(),

        permissions.canComment
          ? internalComment
          : true,
      );

      setComment("");

      if (
        permissions.canComment
      ) {
        setInternalComment(
          false,
        );
      }

      await loadTicket();
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to add comment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteTicket() {
    if (!ticket) {
      return;
    }

    setActionLoading(true);

    try {
      await ticketsService.deleteTicket(
        ticket.id,
      );

      navigate(
        "/tickets",
        {
          replace: true,
        },
      );
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to delete ticket.",
      );

      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />
      </div>
    );
  }

  if (
    !ticket
  ) {
    return (
      <div className="rounded-panel border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
        {error ??
          "Ticket not found."}
      </div>
    );
  }

  const showCommentComposer =
    permissions.canComment ||
    permissions.canInternalComment;

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          navigate(
            "/tickets",
          )
        }
        className="mb-5 flex items-center gap-2 text-xs font-bold text-navy-500 transition hover:text-navy-900"
      >
        <ArrowLeft
          size={15}
        />

        Back to tickets
      </button>

      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* HEADER */}

      <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusBadge
                code={
                  ticket.status.code
                }
                name={
                  ticket.status.name
                }
              />

              <TicketPriorityBadge
                code={
                  ticket.priority.code
                }
                name={
                  ticket.priority.name
                }
              />

              {ticket.isOverdue && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                  <AlertTriangle
                    size={12}
                  />

                  Overdue
                </span>
              )}

              {ticket.isStale && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                  <Clock3
                    size={12}
                  />

                  Stale
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.025em] text-navy-900">
              {ticket.title}
            </h1>

            <div className="mt-2 font-mono text-[10px] text-navy-300">
              {ticket.id}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                void loadTicket()
              }
              className="flex h-10 items-center gap-2 rounded-xl border border-corporate-border px-3 text-xs font-bold text-navy-600"
            >
              <RefreshCw
                size={14}
              />

              Refresh
            </button>

            {permissions.canEdit && (
              <button
                onClick={() =>
                  setEditMode(
                    true,
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-corporate-border px-3 text-xs font-bold text-navy-600"
              >
                <Edit3
                  size={14}
                />

                Edit
              </button>
            )}

            {permissions.canAssign && (
              <button
                onClick={() =>
                  setModal(
                    "assign",
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl bg-navy-900 px-3 text-xs font-bold text-white"
              >
                <UserRoundCheck
                  size={14}
                />

                Assign
              </button>
            )}

            {permissions.canReassign && (
              <button
                onClick={() =>
                  setModal(
                    "reassign",
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl bg-navy-900 px-3 text-xs font-bold text-white"
              >
                <UserRoundCheck
                  size={14}
                />

                Reassign
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* MAIN */}

        <div className="space-y-5">
          {/* EDIT / INFORMATION */}

          <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
            {editMode ? (
              <form
                onSubmit={
                  handleUpdate
                }
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-navy-900">
                    Edit ticket
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setEditMode(
                        false,
                      )
                    }
                    className="text-navy-400"
                  >
                    <X
                      size={18}
                    />
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-navy-700">
                      Title
                    </label>

                    <input
                      value={
                        editTitle
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditTitle(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-corporate-border px-4 text-sm outline-none focus:border-brand-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-navy-700">
                      Description
                    </label>

                    <textarea
                      rows={6}
                      value={
                        editDescription
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditDescription(
                          event
                            .target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-corporate-border p-4 text-sm leading-6 outline-none focus:border-brand-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-navy-700">
                        Priority
                      </label>

                      <select
                        value={
                          editPriorityId
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditPriorityId(
                            event
                              .target
                              .value,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-corporate-border px-3 text-sm"
                      >
                        {priorities.map(
                          (
                            priority,
                          ) => (
                            <option
                              key={
                                priority.id
                              }
                              value={
                                priority.id
                              }
                            >
                              {
                                priority.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {permissions.canEditAny && (
                      <div>
                        <label className="mb-2 block text-xs font-bold text-navy-700">
                          Client
                        </label>

                        <select
                          value={
                            editClientId
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditClientId(
                              event
                                .target
                                .value,
                            )
                          }
                          className="h-11 w-full rounded-xl border border-corporate-border px-3 text-sm"
                        >
                          {clients.map(
                            (
                              client,
                            ) => (
                              <option
                                key={
                                  client.id
                                }
                                value={
                                  client.id
                                }
                              >
                                {
                                  client.name
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>

                  {permissions.canEditAny && (
                    <div>
                      <label className="mb-2 block text-xs font-bold text-navy-700">
                        Due date
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          editDueAt
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditDueAt(
                            event
                              .target
                              .value,
                          )
                        }
                        className="h-11 rounded-xl border border-corporate-border px-3 text-sm"
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      disabled={
                        actionLoading
                      }
                      className="flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white"
                    >
                      <Save
                        size={14}
                      />

                      Save changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-sm font-extrabold text-navy-900">
                  Ticket information
                </h2>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-navy-600">
                  {
                    ticket.description
                  }
                </p>
              </>
            )}
          </section>

          {/* COMMENTS */}

          <section className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={17}
                className="text-brand-600"
              />

              <h2 className="text-sm font-extrabold text-navy-900">
                Comments
              </h2>

              <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold text-navy-500">
                {
                  ticket.comments
                    .length
                }
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {ticket.comments.length ===
                0 && (
                <div className="rounded-xl bg-navy-50/50 p-5 text-center text-xs text-navy-400">
                  No comments yet.
                </div>
              )}

              {ticket.comments.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className={`
                      rounded-xl
                      border
                      p-4
                      ${
                        item.isInternal
                          ? "border-amber-100 bg-amber-50/60"
                          : "border-corporate-border bg-white"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-navy-900">
                            {
                              item.user
                                .name
                            }
                          </span>

                          {item.isInternal && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-amber-700">
                              <Shield
                                size={10}
                              />

                              Internal
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-[10px] text-navy-400">
                          {formatDate(
                            item.createdAt,
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-navy-600">
                      {
                        item.content
                      }
                    </p>
                  </article>
                ),
              )}
            </div>

            {showCommentComposer && (
              <form
                onSubmit={
                  submitComment
                }
                className="mt-6 border-t border-corporate-border pt-5"
              >
                <textarea
                  required
                  value={
                    comment
                  }
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                  rows={4}
                  placeholder={
                    permissions.canInternalComment &&
                    !permissions.canComment
                      ? "Add internal operational comment..."
                      : "Add a comment..."
                  }
                  className="w-full rounded-xl border border-corporate-border p-4 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    {permissions.canInternalComment &&
                      permissions.canComment && (
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-navy-600">
                          <input
                            type="checkbox"
                            checked={
                              internalComment
                            }
                            onChange={(
                              event,
                            ) =>
                              setInternalComment(
                                event
                                  .target
                                  .checked,
                              )
                            }
                          />

                          Internal comment
                        </label>
                      )}

                    {permissions.canInternalComment &&
                      !permissions.canComment && (
                        <span className="text-[10px] font-semibold text-amber-700">
                          This comment will
                          be internal.
                        </span>
                      )}
                  </div>

                  <button
                    disabled={
                      actionLoading ||
                      !comment.trim()
                    }
                    className="flex h-10 items-center gap-2 rounded-xl bg-navy-900 px-4 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <Send
                      size={14}
                    />

                    Add comment
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* HISTORY */}

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
              <h2 className="text-sm font-extrabold text-navy-900">
                Status history
              </h2>

              <div className="mt-5 space-y-4">
                {ticket.statusHistory.map(
                  (
                    history,
                  ) => (
                    <div
                      key={
                        history.id
                      }
                      className="border-l-2 border-brand-200 pl-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {history.fromStatus ? (
                          <>
                            <span className="text-[10px] font-bold text-navy-400">
                              {
                                history
                                  .fromStatus
                                  .name
                              }
                            </span>

                            <span className="text-navy-300">
                              →
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-navy-400">
                            Created as
                          </span>
                        )}

                        <TicketStatusBadge
                          code={
                            history
                              .toStatus
                              .code
                          }
                          name={
                            history
                              .toStatus
                              .name
                          }
                        />
                      </div>

                      <div className="mt-2 text-[10px] text-navy-400">
                        {
                          history
                            .changedBy
                            .name
                        }{" "}
                        ·{" "}
                        {formatDate(
                          history.createdAt,
                        )}
                      </div>
                    </div>
                  ),
                )}

                {ticket.statusHistory
                  .length === 0 && (
                  <p className="text-xs text-navy-400">
                    No status history.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-panel border border-corporate-border bg-white p-6 shadow-card">
              <h2 className="text-sm font-extrabold text-navy-900">
                Assignment history
              </h2>

              <div className="mt-5 space-y-4">
                {ticket.assignmentHistory.map(
                  (
                    history,
                  ) => (
                    <div
                      key={
                        history.id
                      }
                      className="border-l-2 border-navy-100 pl-4"
                    >
                      <div className="text-xs font-bold text-navy-800">
                        {history.fromUser
                          ? `${history.fromUser.name} → ${history.toUser.name}`
                          : `Assigned to ${history.toUser.name}`}
                      </div>

                      <div className="mt-1 text-[10px] text-navy-400">
                        By{" "}
                        {
                          history
                            .assignedBy
                            .name
                        }{" "}
                        ·{" "}
                        {formatDate(
                          history.createdAt,
                        )}
                      </div>
                    </div>
                  ),
                )}

                {ticket
                  .assignmentHistory
                  .length ===
                  0 && (
                  <p className="text-xs text-navy-400">
                    No assignment history.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}

        <aside className="space-y-5">
          <section className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-navy-400">
              Operational data
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <div className="text-[10px] font-bold uppercase text-navy-400">
                  Client
                </div>

                <div className="mt-1 text-sm font-extrabold text-navy-900">
                  {
                    ticket.client
                      .name
                  }
                </div>

                <div className="mt-1 text-[10px] text-navy-400">
                  {
                    ticket.client
                      .email
                  }
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-navy-400">
                  Assigned agent
                </div>

                <div className="mt-1 text-sm font-extrabold text-navy-900">
                  {ticket.assignedTo
                    ?.name ??
                    "Unassigned"}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-navy-400">
                  <Calendar
                    size={11}
                  />

                  Due date
                </div>

                <div className="mt-1 text-xs font-bold text-navy-700">
                  {formatDate(
                    ticket.dueAt,
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-navy-400">
                  Created by
                </div>

                <div className="mt-1 text-xs font-bold text-navy-700">
                  {
                    ticket
                      .createdBy
                      .name
                  }
                </div>

                <div className="mt-1 text-[10px] text-navy-400">
                  {formatDate(
                    ticket.createdAt,
                  )}
                </div>
              </div>

              {ticket.resolvedBy && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-navy-400">
                    Resolved by
                  </div>

                  <div className="mt-1 text-xs font-bold text-emerald-700">
                    {
                      ticket
                        .resolvedBy
                        .name
                    }
                  </div>

                  <div className="mt-1 text-[10px] text-navy-400">
                    {formatDate(
                      ticket.resolvedAt,
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ACTIONS */}

          <section className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-navy-400">
              Actions
            </h2>

            <div className="mt-4 space-y-2">
              {permissions.canChangeStatus &&
                allowedStatuses.length >
                  0 && (
                  <button
                    onClick={() =>
                      setModal(
                        "status",
                      )
                    }
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-corporate-border text-xs font-bold text-navy-700 transition hover:bg-navy-50"
                  >
                    <RefreshCw
                      size={14}
                    />

                    Change status
                  </button>
                )}

              {permissions.canClose && (
                <button
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    void runAction(
                      () =>
                        ticketsService.closeTicket(
                          ticket.id,
                        ),
                    )
                  }
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white"
                >
                  <CheckCircle2
                    size={14}
                  />

                  Close ticket
                </button>
              )}

              {permissions.canReopen && (
                <button
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    void runAction(
                      () =>
                        ticketsService.reopenTicket(
                          ticket.id,
                        ),
                    )
                  }
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-xs font-bold text-white"
                >
                  <RefreshCw
                    size={14}
                  />

                  Reopen ticket
                </button>
              )}

              {permissions.canDelete && (
                <button
                  onClick={() =>
                    setModal(
                      "delete",
                    )
                  }
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2
                    size={14}
                  />

                  Delete ticket
                </button>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* ASSIGN MODAL */}

      <TicketModal
        open={
          modal === "assign" ||
          modal === "reassign"
        }
        onClose={() =>
          setModal(null)
        }
        title={
          modal === "assign"
            ? "Assign ticket"
            : "Reassign ticket"
        }
        description="Select the support agent responsible for this ticket."
      >
        <select
          value={
            selectedAgent
          }
          onChange={(event) =>
            setSelectedAgent(
              event.target.value,
            )
          }
          className="h-12 w-full rounded-xl border border-corporate-border px-3 text-sm"
        >
          <option value="">
            Select agent
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

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() =>
              setModal(null)
            }
            className="h-10 rounded-xl border border-corporate-border px-4 text-xs font-bold text-navy-600"
          >
            Cancel
          </button>

          <button
            disabled={
              !selectedAgent ||
              actionLoading
            }
            onClick={() => {
              if (
                !selectedAgent
              ) {
                return;
              }

              if (
                modal ===
                "assign"
              ) {
                void runAction(
                  () =>
                    ticketsService.assignTicket(
                      ticket.id,
                      selectedAgent,
                    ),
                );
              } else {
                void runAction(
                  () =>
                    ticketsService.reassignTicket(
                      ticket.id,
                      selectedAgent,
                    ),
                );
              }
            }}
            className="h-10 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </TicketModal>

      {/* STATUS MODAL */}

      <TicketModal
        open={
          modal === "status"
        }
        onClose={() =>
          setModal(null)
        }
        title="Change ticket status"
        description={`Current status: ${ticket.status.name}`}
      >
        <select
          value={
            selectedStatus
          }
          onChange={(event) =>
            setSelectedStatus(
              event.target
                .value as TicketStatusCode,
            )
          }
          className="h-12 w-full rounded-xl border border-corporate-border px-3 text-sm"
        >
          <option value="">
            Select new status
          </option>

          {allowedStatuses.map(
            (status) => (
              <option
                key={
                  status
                }
                value={
                  status
                }
              >
                {status.replace(
                  "_",
                  " ",
                )}
              </option>
            ),
          )}
        </select>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() =>
              setModal(null)
            }
            className="h-10 rounded-xl border border-corporate-border px-4 text-xs font-bold text-navy-600"
          >
            Cancel
          </button>

          <button
            disabled={
              !selectedStatus ||
              actionLoading
            }
            onClick={() => {
              if (
                !selectedStatus
              ) {
                return;
              }

              void runAction(
                () =>
                  ticketsService.changeStatus(
                    ticket.id,
                    {
                      status:
                        selectedStatus,
                    },
                  ),
              );
            }}
            className="h-10 rounded-xl bg-brand-500 px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            Change status
          </button>
        </div>
      </TicketModal>

      {/* DELETE MODAL */}

      <TicketModal
        open={
          modal === "delete"
        }
        onClose={() =>
          setModal(null)
        }
        title="Delete ticket"
        description="The ticket will be soft-deleted. Its historical information remains stored for traceability."
      >
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="shrink-0 text-red-500"
            />

            <p className="text-xs leading-5 text-red-700">
              Are you sure you
              want to delete
              <strong>
                {" "}
                {ticket.title}
              </strong>
              ?
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() =>
              setModal(null)
            }
            className="h-10 rounded-xl border border-corporate-border px-4 text-xs font-bold text-navy-600"
          >
            Cancel
          </button>

          <button
            disabled={
              actionLoading
            }
            onClick={() =>
              void deleteTicket()
            }
            className="h-10 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-50"
          >
            Delete ticket
          </button>
        </div>
      </TicketModal>
    </div>
  );
}