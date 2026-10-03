import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "./cn";

export function Toast({ toast, onDismiss }) {
    const isSuccess = toast.type === "success";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
                "pointer-events-auto flex max-w-sm items-start gap-3 border-2 px-4 py-3 shadow-[4px_4px_0_rgba(44,24,16,0.08)]",
                isSuccess
                    ? "border-[var(--theme-ink)] bg-[var(--theme-ink)] text-[var(--theme-bg)]"
                    : "border-[var(--theme-ink)] bg-[var(--theme-surface)] text-[var(--theme-ink)]"
            )}
            role="status"
            aria-live="polite"
        >
            {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            )}

            <div className="flex-1">
                <p className="font-serif text-sm font-bold">{toast.text}</p>
            </div>

            {onDismiss && (
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="text-current opacity-75 transition-opacity hover:opacity-100"
                    aria-label="Dismiss notification"
                >
                    <span aria-hidden="true">×</span>
                </button>
            )}
        </motion.div>
    );
}

export default Toast;

export function ToastViewport({ toasts, onDismiss, className = "" }) {
    return (
        <div className={cn("pointer-events-none fixed bottom-4 right-4 z-50 space-y-3", className)}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
}
