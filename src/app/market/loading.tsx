import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";

export default function MarketLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full rounded-[9px]" />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-[7px]" />
        ))}
      </div>
      <div className="overflow-hidden rounded-[10px] border border-hx-border bg-hx-card p-3 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
