import * as React from "react";
import { cn } from "@/lib/utils";
import { VerifiedIcon } from "@/components/ui/verified-icon";

export type BadgeVariant =
  | "default"
  | "subtle"
  | "outline"
  | "verified"
  | "positive"
  | "negative"
  | "muted";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-hx-primary text-white",
  subtle: "border border-hx-primary/20 bg-hx-primary-subtle text-hx-link",
  outline: "border border-hx-border bg-hx-card text-hx-secondary",
  verified: "border border-hx-primary/25 bg-hx-primary-subtle text-hx-link",
  positive: "bg-hx-positive-subtle text-hx-positive",
  negative: "bg-hx-negative-subtle text-hx-negative",
  muted: "bg-hx-bg text-hx-muted",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {variant === "verified" ? (
        <VerifiedIcon className="size-3" title="" />
      ) : null}
      {children}
    </span>
  );
}
