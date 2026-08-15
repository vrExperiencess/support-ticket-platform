// src/components/dashboard/MetricCard.tsx

import type {
  LucideIcon,
} from "lucide-react";

interface MetricCardProps {
  label: string;

  value: number;

  description?: string;

  icon: LucideIcon;

  alert?: boolean;
}

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  alert = false,
}: MetricCardProps) {
  return (
    <article className="rounded-panel border border-corporate-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl

            ${
              alert
                ? "bg-red-50 text-red-600"
                : "bg-navy-50 text-navy-700"
            }
          `}
        >
          <Icon
            size={19}
          />
        </div>

        <span
          className={`
            h-2
            w-2
            rounded-full

            ${
              alert
                ? "bg-red-500"
                : "bg-brand-500"
            }
          `}
        />
      </div>

      <div className="mt-5 text-3xl font-extrabold tracking-[-0.035em] text-navy-900">
        {value}
      </div>

      <div className="mt-2 text-xs font-extrabold text-navy-800">
        {label}
      </div>

      {description && (
        <div className="mt-1 text-[10px] leading-4 text-corporate-muted">
          {description}
        </div>
      )}
    </article>
  );
}