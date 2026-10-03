import { cn } from "./cn";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--theme-surface-2)]",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
