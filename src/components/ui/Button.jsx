import { cn } from "./cn";

const variants = {
    primary:
        "border-[var(--theme-border-strong)] bg-[var(--theme-ink)] text-[var(--theme-bg)] hover:brightness-110",
    secondary:
        "border-[var(--theme-border-strong)] bg-[var(--theme-surface)] text-[var(--theme-ink)] hover:bg-[var(--theme-surface-2)]",
    ghost:
        "border-transparent bg-transparent text-[var(--theme-ink-muted)] hover:bg-[var(--theme-surface-2)] hover:text-[var(--theme-ink)]",
    danger:
        "border-[var(--theme-border-strong)] bg-[var(--theme-surface)] text-[var(--theme-ink)] hover:bg-[var(--theme-surface-2)]",
    success:
        "border-[var(--theme-border-strong)] bg-[var(--theme-surface-2)] text-[var(--theme-ink)] hover:bg-[var(--theme-surface-3)]",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
    icon: "h-9 w-9 p-0",
};

export function Button({
    children,
    className = "",
    variant = "primary",
    size = "md",
    loading = false,
    ...props
}) {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70",
                variants[variant],
                sizes[size],
                className,
                loading && "cursor-wait"
            )}
            aria-busy={loading}
            disabled={loading || props.disabled}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
