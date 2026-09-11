"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ProductLogoSize = "sm" | "md" | "lg";

const sizeMap: Record<ProductLogoSize, { box: string; pad: string; text: string }> = {
  sm: { box: "size-8", pad: "p-1", text: "text-[10px]" },
  md: { box: "size-9", pad: "p-1.5", text: "text-[11px]" },
  lg: { box: "size-10", pad: "p-[7px]", text: "text-xs" },
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function hostFromDomain(domain?: string | null) {
  if (!domain) return "";
  return domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

/** Ordered logo candidates: larger branded icons first, tiny favicons last. */
export function logoCandidates(domain?: string | null, logoUrl?: string | null): string[] {
  const urls: string[] = [];
  const trimmed = logoUrl?.trim();
  if (trimmed) urls.push(trimmed);

  const host = hostFromDomain(domain);
  if (host) {
    urls.push(
      `https://icons.duckduckgo.com/ip3/${host}.ico`,
      `https://www.google.com/s2/favicons?sz=128&domain_url=https://${host}`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
    );
  }

  return [...new Set(urls)];
}

export interface ProductLogoProps {
  name: string;
  logoUrl?: string | null;
  domain?: string | null;
  size?: ProductLogoSize;
  className?: string;
  alt?: string;
}

export function ProductLogo({
  name,
  logoUrl,
  domain,
  size = "md",
  className,
  alt,
}: ProductLogoProps) {
  const candidates = React.useMemo(
    () => logoCandidates(domain, logoUrl),
    [domain, logoUrl],
  );
  const [index, setIndex] = React.useState(0);
  const initials = initialsFromName(name);
  const dims = sizeMap[size];
  const src = candidates[index];
  const showImage = Boolean(src);

  React.useEffect(() => {
    setIndex(0);
  }, [candidates.join("|")]);

  if (!showImage) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[6px] font-semibold text-hx-primary",
          dims.box,
          dims.text,
          className,
        )}
        aria-label={alt ?? name}
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[6px]",
        dims.box,
        className,
      )}
      aria-label={alt ?? name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onError={() => {
          if (index + 1 < candidates.length) {
            setIndex((i) => i + 1);
          } else {
            setIndex(candidates.length);
          }
        }}
        className="size-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
