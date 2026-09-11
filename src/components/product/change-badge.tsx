import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/formatting/decimal";

export interface ChangeBadgeProps {
  value: number;
  className?: string;
  showSign?: boolean;
  digits?: number;
}

export function ChangeBadge({
  value,
  className,
  showSign = true,
  digits = 2,
}: ChangeBadgeProps) {
  const positive = value > 0;
  const negative = value < 0;
  const flat = !positive && !negative;

  const label = showSign
    ? formatPercent(value, digits)
    : `${Math.abs(value).toFixed(digits)}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono-num text-xs font-medium tabular-nums",
        positive && "text-hx-positive",
        negative && "text-hx-negative",
        flat && "text-hx-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
