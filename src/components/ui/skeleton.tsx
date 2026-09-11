import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
