interface UserStatusBadgeProps {
  active:
    boolean;
}

export default function UserStatusBadge({
  active,
}: UserStatusBadgeProps) {
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

        ${
          active
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-100 text-slate-500"
        }
      `}
    >
      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}