import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-12",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-hx-bg text-hx-muted",
          compact ? "size-10" : "size-12",
        )}
      >
        {icon ?? <Inbox className={compact ? "size-5" : "size-6"} aria-hidden />}
      </div>
      <div className="space-y-1">
        <p className={cn("font-medium text-hx-text", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-hx-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
