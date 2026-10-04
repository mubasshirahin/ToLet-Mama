import { useId } from "react";
import { cn } from "./cn";

export function Input({
    icon: Icon,
    error,
    errorMessage,
    className = "",
    wrapperClassName = "",
    id,
    "aria-describedby": describedBy,
    ...props
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const ariaDescribedBy = [describedBy, errorId].filter(Boolean).join(" ") || undefined;
    const isInvalid = Boolean(error || errorMessage);

    return (
        <div className={wrapperClassName}>
            <div className="relative">
                {Icon && (
                    <Icon
                        className={cn(
                            "pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2",
                            isInvalid ? "text-[var(--theme-ink)]" : "text-[var(--theme-ink-muted)]"
                        )}
                        strokeWidth={1.5}
                    />
                )}

                <input
                    {...props}
                    id={inputId}
                    aria-invalid={isInvalid || undefined}
                    aria-describedby={ariaDescribedBy}
                    className={cn(
                        "w-full border-b-2 border-[var(--theme-border)] bg-transparent py-3 font-serif text-sm text-[var(--theme-ink)] outline-none transition-colors placeholder:text-[var(--theme-ink-faded)]",
                        Icon && "pl-7",
                        isInvalid ? "border-[var(--theme-ink)]" : "focus:border-[var(--theme-ink)]",
                        className
                    )}
                />
            </div>
            {errorMessage && (
                <p id={errorId} role="alert" className="mt-1.5 text-xs text-[var(--theme-ink)]">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

export default Input;
