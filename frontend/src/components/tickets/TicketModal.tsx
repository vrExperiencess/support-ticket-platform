import {
  X,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

interface TicketModalProps {
  open: boolean;

  title: string;

  description?: string;

  children: ReactNode;

  onClose: () => void;
}

export default function TicketModal({
  open,
  title,
  description,
  children,
  onClose,
}: TicketModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-panel bg-white shadow-floating">
        <div className="flex items-start justify-between border-b border-corporate-border px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-navy-900">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs leading-5 text-corporate-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 transition hover:bg-navy-50 hover:text-navy-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}