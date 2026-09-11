import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-[10px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-[340px] rounded-[10px]" />
          <Skeleton className="h-64 rounded-[10px]" />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <Skeleton className="h-48 rounded-[10px]" />
          <div className="rounded-[10px] border border-hx-border bg-hx-card p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
