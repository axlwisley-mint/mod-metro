import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ProgressTask } from "@/lib/launcher/types";

export function NovaMark({ className }: { className?: string }) {
  // Isometric cube mark
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden>
      <path d="M12 2.5 20.5 7.2v9.6L12 21.5 3.5 16.8V7.2z" className="fill-accent-surface stroke-primary" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2" className="stroke-primary" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

export function PageHeader({ title, subtitle, aside }: { title: string; subtitle: string; aside?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-title font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>
      </div>
      {aside}
    </header>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-section font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-tiny font-semibold uppercase tracking-[0.08em]",
        tone === "accent" && "border-primary/30 bg-accent-surface text-primary",
        tone === "warning" && "border-warning/30 text-warning",
        tone === "neutral" && "border-border text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone === "accent" ? "bg-primary" : tone === "warning" ? "bg-warning" : "bg-faint")} />
      {children}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="rounded-sm border border-border px-1.5 py-px text-tiny font-medium text-faint">Demo</span>
  );
}

export function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-meta font-medium text-muted-foreground">{children}</label>
      {hint}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-elevated text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <p className="text-section font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-body text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Reusable progress readout for future install/download tasks. */
export function TaskProgress({ task }: { task: ProgressTask }) {
  const pct = Math.max(0, Math.min(100, task.percent));
  return (
    <div role="group" aria-label={task.label}>
      <div className="mb-2 flex items-baseline justify-between text-meta">
        <span className="font-medium">{task.label}</span>
        <span className="tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      {(task.message || task.transfer) && (
        <div className="mt-2 flex justify-between text-tiny text-faint">
          <span>{task.message}</span>
          <span className="tabular-nums">{task.transfer}</span>
        </div>
      )}
    </div>
  );
}

export const selectTriggerClass =
  "h-10 rounded-md border-border bg-background px-3 text-body shadow-none transition-colors duration-150 hover:border-faint/60 focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const selectContentClass =
  "rounded-md border-border bg-elevated p-1 shadow-xl data-[state=open]:duration-150 data-[state=closed]:duration-100";
export const selectItemClass = "h-9 cursor-pointer rounded-sm text-body focus:bg-surface data-[state=checked]:text-primary";
export const inputClass =
  "h-10 rounded-md border-border bg-background text-body shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const dialogClass = "max-w-md gap-0 rounded-xl border-border bg-surface p-6 shadow-2xl data-[state=open]:duration-200 data-[state=closed]:duration-150";
