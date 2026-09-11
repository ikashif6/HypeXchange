import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-[320px] rounded-[10px]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-[10px]" />
            ))}
          </div>
          <div className="rounded-[10px] border border-hx-border bg-hx-card p-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 rounded-[10px] lg:col-span-3" />
      </div>
    </div>
  );
}
