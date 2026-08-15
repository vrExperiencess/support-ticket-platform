import {
  ShieldX,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <ShieldX
            size={26}
          />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-navy-900">
          Access restricted
        </h1>

        <p className="mt-3 text-sm leading-6 text-corporate-muted">
          Your current role does
          not have permission to
          access this module.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-orange"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}