import { cn } from "./cn";

export function Card({ as: Component = "div", className = "", ...props }) {
    const Tag = Component;

    return (
        <Tag
            className={cn(
                "rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/95 p-5 shadow-[0_10px_30px_rgba(44,24,16,0.06)] backdrop-blur-sm",
                className
            )}
            {...props}
        />
    );
}

export default Card;
