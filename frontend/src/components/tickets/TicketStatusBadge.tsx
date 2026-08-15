import type {
  TicketStatusCode,
} from "../../features/tickets/ticket.types";

interface TicketStatusBadgeProps {
  code: string;
  name?: string;
}

const styles: Record<
  TicketStatusCode,
  string
> = {
  OPEN:
    "border-blue-100 bg-blue-50 text-blue-700",

  IN_PROGRESS:
    "border-amber-100 bg-amber-50 text-amber-700",

  RESOLVED:
    "border-emerald-100 bg-emerald-50 text-emerald-700",

  CLOSED:
    "border-slate-200 bg-slate-100 text-slate-600",
};

export default function TicketStatusBadge({
  code,
  name,
}: TicketStatusBadgeProps) {
  const style =
    styles[
      code as TicketStatusCode
    ] ??
    "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-extrabold
        uppercase
        tracking-[0.06em]
        ${style}
      `}
    >
      {name ?? code}
    </span>
  );
}