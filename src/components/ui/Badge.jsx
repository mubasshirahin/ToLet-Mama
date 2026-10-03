import { cn } from "./cn";

const variants = {
  neutral: "border-[var(--theme-border)] bg-[var(--theme-surface-2)] text-[var(--theme-ink)]",
  primary: "border-[var(--theme-border-strong)] bg-[var(--theme-ink)] text-[var(--theme-bg)]",
  success: "border-[var(--theme-border-strong)] bg-[var(--theme-surface-3)] text-[var(--theme-ink)]",
  subtle: "border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-ink-muted)]",
};

export function Badge({ children, className = "", variant = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
