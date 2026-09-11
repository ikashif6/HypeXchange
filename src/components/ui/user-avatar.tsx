import { resolveAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  sm: "size-8",
  md: "size-9",
  lg: "size-16 sm:size-[4.5rem]",
  xl: "size-20",
} as const;

const PIXEL_SIZE = {
  sm: 64,
  md: 72,
  lg: 128,
  xl: 160,
} as const;

export function UserAvatar({
  username,
  displayName,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const src = resolveAvatarUrl(avatarUrl, username, PIXEL_SIZE[size]);
  const alt = displayName ? `${displayName}'s avatar` : `@${username}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "shrink-0 rounded-full border border-hx-border bg-hx-bg object-cover",
        SIZE_CLASS[size],
        className,
      )}
    />
  );
}
