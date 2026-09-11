import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedIcon({
  className,
  title = "Verified",
}: {
  className?: string;
  title?: string;
}) {
  const decorative = !title;

  return (
    <BadgeCheck
      className={cn("size-3.5 shrink-0 text-hx-link", className)}
      fill="currentColor"
      stroke="var(--hx-card)"
      strokeWidth={2}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    />
  );
}
