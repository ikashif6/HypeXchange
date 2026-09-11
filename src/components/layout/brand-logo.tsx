import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
  priority = false,
}: {
  className?: string;
  href?: string;
  priority?: boolean;
}) {
  const imgClass = "h-7 w-auto sm:h-8";
  const priorityProps = priority ? ({ fetchPriority: "high" } as const) : {};

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt="HypeXchange"
        className={cn(imgClass, "dark:hidden")}
        {...priorityProps}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-dark.png"
        alt="HypeXchange"
        className={cn(imgClass, "hidden dark:block")}
        {...priorityProps}
      />
    </Link>
  );
}
