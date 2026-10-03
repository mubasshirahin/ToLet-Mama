import { cn } from "./cn";

export function Input({
  icon: Icon,
  error,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {Icon && (
        <Icon
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2",
            error ? "text-[var(--theme-ink)]" : "text-[var(--theme-ink-muted)]"
          )}
          strokeWidth={1.5}
        />
      )}

      <input
        {...props}
        className={cn(
          "w-full border-b-2 border-[var(--theme-border)] bg-transparent py-3 font-serif text-sm text-[var(--theme-ink)] outline-none transition-colors placeholder:text-[var(--theme-ink-faded)]",
          Icon && "pl-7",
          error ? "border-[var(--theme-ink)]" : "focus:border-[var(--theme-ink)]",
          className
        )}
      />
    </div>
  );
}

export default Input;
