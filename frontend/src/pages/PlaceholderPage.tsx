interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="rounded-panel border border-corporate-border bg-white p-8 shadow-card">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
        Module
      </span>

      <h1 className="mt-2 text-3xl font-extrabold text-navy-900">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-corporate-muted">
        {description}
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 p-10 text-center text-xs font-semibold text-navy-400">
        This module will be
        implemented in the next
        application slice.
      </div>
    </div>
  );
}