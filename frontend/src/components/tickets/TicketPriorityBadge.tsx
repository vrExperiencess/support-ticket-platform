import type {
  TicketPriorityCode,
} from "../../features/tickets/ticket.types";

interface TicketPriorityBadgeProps {
  code: string;
  name?: string;
}

const styles: Record<
  TicketPriorityCode,
  string
> = {
  LOW:
    "bg-slate-100 text-slate-600",

  MEDIUM:
    "bg-blue-50 text-blue-700",

  HIGH:
    "bg-orange-50 text-orange-700",

  CRITICAL:
    "bg-red-50 text-red-700",
};

export default function TicketPriorityBadge({
  code,
  name,
}: TicketPriorityBadgeProps) {
  const style =
    styles[
      code as TicketPriorityCode
    ] ??
    "bg-slate-100 text-slate-600";

  return (
    <span
      className={`
        inline-flex
        rounded-lg
        px-2.5
        py-1
        text-[10px]
        font-bold
        uppercase
        ${style}
      `}
    >
      {name ?? code}
    </span>
  );
}