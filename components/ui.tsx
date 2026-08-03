"use client";

import clsx from "clsx";

export function Field({
  label,
  hint,
  htmlFor,
  children
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  id,
  value,
  type = "text",
  placeholder,
  onChange
}: {
  id?: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-ink outline-none transition focus:border-accent"
    />
  );
}

export function OptionCard({
  active,
  icon,
  flag,
  label,
  description,
  badge,
  onClick
}: {
  active: boolean;
  icon?: React.ReactNode;
  flag?: string;
  label: string;
  description?: string;
  badge?: "ready" | "missing" | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
        active ? "border-ink bg-ink text-white shadow-soft" : "border-slate-200 bg-white text-ink hover:border-slate-400"
      )}
    >
      {flag ? (
        <span className="text-2xl leading-none" aria-hidden>
          {flag}
        </span>
      ) : icon ? (
        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            active ? "bg-white/10 text-teal-200" : "bg-accentSoft text-accent"
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {description ? (
          <span className={clsx("mt-0.5 block truncate text-sm", active ? "text-white/70" : "text-slate-500")}>
            {description}
          </span>
        ) : null}
      </span>
      {badge ? (
        <span
          className={clsx(
            "h-2.5 w-2.5 shrink-0 rounded-full",
            badge === "ready" ? "bg-emerald-500" : "bg-slate-300"
          )}
        />
      ) : null}
    </button>
  );
}

export function StepIndicator({
  steps,
  current,
  labels
}: {
  steps: number;
  current: number;
  labels: string[];
}) {
  return (
    <ol className="flex items-center gap-2">
      {Array.from({ length: steps }).map((_, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={index} className="flex flex-1 items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <span
                className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                  active ? "bg-ink text-white" : done ? "bg-accent text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={clsx(
                  "hidden truncate text-sm font-semibold sm:block",
                  active ? "text-ink" : done ? "text-ink/70" : "text-slate-400"
                )}
              >
                {labels[index]}
              </span>
            </div>
            {index < steps - 1 ? (
              <span className={clsx("h-px flex-1", done ? "bg-accent" : "bg-slate-200")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  className
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
