interface UserRoleBadgeProps {
  code:
    string;

  name:
    string;
}

export default function UserRoleBadge({
  code,
  name,
}: UserRoleBadgeProps) {
  const style =
    code === "ADMIN"
      ? "bg-purple-50 text-purple-700 border-purple-100"
      : code ===
          "SUPERVISOR"
        ? "bg-blue-50 text-blue-700 border-blue-100"
        : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`
        inline-flex
        rounded-lg
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        ${style}
      `}
    >
      {name}
    </span>
  );
}