import { Skeleton } from "./Skeleton";

export function ListingCardSkeleton({ variant = "grid" }) {
    const isList = variant === "list";

    return (
        <article
            aria-hidden="true"
            className={`glass-pane animate-pulse overflow-hidden rounded-2xl ${isList ? "grid md:grid-cols-[240px_minmax(0,1fr)]" : "flex flex-col"}`}
        >
            <Skeleton className={`w-full ${isList ? "h-56 md:h-full md:min-h-56" : "h-52"}`} />
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-6 w-3/4" />
                    {!isList && <Skeleton className="h-7 w-24" />}
                </div>
                <Skeleton className="mt-3 h-4 w-1/2" />
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-5/6" />
                </div>
                <div className="mt-4 flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--theme-border)] pt-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </div>
            </div>
        </article>
    );
}

export default ListingCardSkeleton;