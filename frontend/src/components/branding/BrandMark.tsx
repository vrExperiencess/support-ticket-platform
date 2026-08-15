import { Infinity } from "lucide-react";

interface BrandMarkProps {
  compact?: boolean;
  light?: boolean;
}

export default function BrandMark({
  compact = false,
  light = false,
}: BrandMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-orange">
        <Infinity
          size={22}
          strokeWidth={2.3}
          className="text-white"
        />
      </div>

      {!compact && (
        <div className="leading-none">
          <div
            className={`text-[15px] font-extrabold tracking-[0.08em] ${
              light
                ? "text-white"
                : "text-navy-900"
            }`}
          >
            INFINI
            <span className="text-brand-500">
              VIRT
            </span>
          </div>

          <span
            className={`mt-1 block text-[9px] font-medium uppercase tracking-[0.22em] ${
              light
                ? "text-navy-200"
                : "text-navy-500"
            }`}
          >
            Support Center
          </span>
        </div>
      )}
    </div>
  );
}