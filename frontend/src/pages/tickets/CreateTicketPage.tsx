import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  TicketCatalogItem,
  TicketLookupOption,
} from "../../features/tickets/ticket.types";

import {
  ticketsService,
} from "../../services/tickets.service";

export default function CreateTicketPage() {
  const navigate =
    useNavigate();

  const [
    clients,
    setClients,
  ] =
    useState<TicketLookupOption[]>([]);

  const [
    priorities,
    setPriorities,
  ] =
    useState<TicketCatalogItem[]>([]);

  const [
    clientId,
    setClientId,
  ] =
    useState("");

  const [
    priorityId,
    setPriorityId,
  ] =
    useState("");

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    dueAt,
    setDueAt,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    async function loadFormData() {
      setLoading(true);

      try {
        const [
          clientsData,
          prioritiesData,
        ] =
          await Promise.all([
            ticketsService.getClients(),
            ticketsService.getPriorities(),
          ]);

        setClients(
          clientsData,
        );

        setPriorities(
          prioritiesData,
        );

        /**
         * Medium es un buen default
         * para reducir errores de captura.
         */
        const medium =
          prioritiesData.find(
            (priority) =>
              priority.code ===
              "MEDIUM",
          );

        if (medium) {
          setPriorityId(
            medium.id,
          );
        }
      } catch (requestError) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to load form information.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadFormData();
  }, []);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const ticket =
        await ticketsService.createTicket(
          {
            clientId,

            title:
              title.trim(),

            description:
              description.trim(),

            priorityId,

            ...(dueAt
              ? {
                  dueAt:
                    new Date(
                      dueAt,
                    ).toISOString(),
                }
              : {}),
          },
        );

      navigate(
        `/tickets/${ticket.id}`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to create ticket.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
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

      <div className="rounded-panel border border-corporate-border bg-white shadow-card">
        <div className="border-b border-corporate-border p-7">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
            New support request
          </span>

          <h1 className="mt-2 text-2xl font-extrabold text-navy-900">
            Create ticket
          </h1>

          <p className="mt-2 text-sm text-corporate-muted">
            Register a new
            customer support
            request. The initial
            status will
            automatically be OPEN.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6 p-7"
        >
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-navy-700">
                Client *
              </label>

              <select
                required
                value={
                  clientId
                }
                onChange={(
                  event,
                ) =>
                  setClientId(
                    event.target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-corporate-border bg-white px-3 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">
                  Select client
                </option>

                {clients.map(
                  (client) => (
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

            <div>
              <label className="mb-2 block text-xs font-bold text-navy-700">
                Priority *
              </label>

              <select
                required
                value={
                  priorityId
                }
                onChange={(
                  event,
                ) =>
                  setPriorityId(
                    event.target
                      .value,
                  )
                }
                className="h-12 w-full rounded-xl border border-corporate-border bg-white px-3 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">
                  Select priority
                </option>

                {priorities.map(
                  (priority) => (
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
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-navy-700">
              Title *
            </label>

            <input
              required
              minLength={3}
              maxLength={255}
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target
                    .value,
                )
              }
              placeholder="Describe the issue briefly"
              className="h-12 w-full rounded-xl border border-corporate-border px-4 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-navy-700">
              Description *
            </label>

            <textarea
              required
              minLength={5}
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target
                    .value,
                )
              }
              rows={7}
              placeholder="Provide all relevant information about the incident..."
              className="w-full resize-y rounded-xl border border-corporate-border p-4 text-sm leading-6 text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-navy-700">
              Due date
            </label>

            <input
              type="datetime-local"
              value={dueAt}
              onChange={(event) =>
                setDueAt(
                  event.target
                    .value,
                )
              }
              className="h-12 w-full rounded-xl border border-corporate-border px-4 text-sm text-navy-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 md:max-w-sm"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-corporate-border pt-6">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/tickets",
                )
              }
              className="h-11 rounded-xl border border-corporate-border px-5 text-xs font-bold text-navy-600"
            >
              Cancel
            </button>

            <button
              disabled={
                submitting
              }
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-xs font-extrabold text-white shadow-orange disabled:opacity-60"
            >
              <Save
                size={15}
              />

              {submitting
                ? "Creating..."
                : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}