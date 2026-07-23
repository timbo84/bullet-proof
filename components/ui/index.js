"use client";

const BUTTON_VARIANTS = {
  primary: "bg-primary text-bg hover:bg-primary-hover",
  outline: "border border-border text-text hover:border-primary",
  danger: "bg-danger text-white hover:brightness-110",
  ghost: "text-text-secondary hover:text-text",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`font-heading text-sm font-semibold uppercase tracking-widest text-text-secondary ${className}`}
    >
      {children}
    </h2>
  );
}

export function Divider({ className = "" }) {
  return <div className={`h-px w-full bg-border ${className}`} />;
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
      <input
        className={`rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
      <textarea
        className={`rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

export function Chip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-text-secondary ${className}`}
    >
      {children}
    </span>
  );
}

const BADGE_TONES = {
  neutral: "bg-surface-raised text-text-secondary border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  success: "bg-success/15 text-success border-success/30",
};

export function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Immutable per design_guidelines.json. Any category not in this set (e.g.
// the legacy "Community" tag) falls back to the Wellness color, spec-approved.
export const CATEGORY_COLORS = {
  Finance: "var(--color-category-finance)",
  Fitness: "var(--color-category-fitness)",
  Family: "var(--color-category-family)",
  Wellness: "var(--color-category-wellness)",
  Training: "var(--color-category-training)",
};

export function CategoryTag({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Wellness;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold"
      style={{ color, borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function Avatar({ src, name, size = 40 }) {
  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Avatar"}
        style={style}
        className="rounded-full border border-border object-cover"
      />
    );
  }

  return (
    <span
      style={style}
      className="flex items-center justify-center rounded-full border border-border bg-surface-raised font-semibold text-text-secondary"
    >
      {initials}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-text">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text">{value}</p>
    </Card>
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary ${className}`}
    />
  );
}
