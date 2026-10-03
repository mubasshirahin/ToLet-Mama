import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "./cn";

const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
    className = "",
}) {
    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-ink)]/40 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                            "w-full rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_24px_80px_rgba(44,24,16,0.18)]",
                            sizes[size],
                            className
                        )}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {(title || onClose) && (
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    {title && (
                                        <h3 className="font-serif text-xl font-black text-[var(--theme-ink)]">{title}</h3>
                                    )}
                                    {description && (
                                        <p className="mt-1 text-sm text-[var(--theme-ink-muted)]">{description}</p>
                                    )}
                                </div>

                                {onClose && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-ink-muted)] transition-colors hover:bg-[var(--theme-surface-2)] hover:text-[var(--theme-ink)]"
                                        aria-label="Close dialog"
                                    >
                                        <X className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                        )}

                        <div>{children}</div>

                        {footer && <div className="mt-5 flex justify-end gap-3">{footer}</div>}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

export default Modal;
