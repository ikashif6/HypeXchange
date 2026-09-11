/** Soft pastel backgrounds so doodles feel like Gmail-style defaults. */
const DOODLE_BACKGROUNDS = [
  "e8e4ff",
  "dde7ff",
  "e4f2ff",
  "e6f7f0",
  "fff3e0",
  "ffe8ef",
  "f3e8ff",
  "eef2ff",
].join(",");

function isGeneratedDoodle(url: string): boolean {
  return url.includes("api.dicebear.com/");
}

/**
 * Stable cartoon/doodle avatar for a user.
 * Seeded by username so the same person always gets the same doodle
 * until they upload/set a custom avatarUrl.
 */
export function doodleAvatarUrl(seed: string, size = 128): string {
  const value = seed.trim().toLowerCase() || "trader";
  const params = new URLSearchParams({
    seed: value,
    size: String(size),
    backgroundColor: DOODLE_BACKGROUNDS,
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}

/**
 * Prefer a custom uploaded/linked avatar; otherwise assign a deterministic doodle.
 * Empty avatarUrl in the DB means “system doodle” for every user until they change it.
 */
export function resolveAvatarUrl(
  customUrl: string | null | undefined,
  seed: string,
  size = 128,
): string {
  const custom = customUrl?.trim();
  if (custom && !isGeneratedDoodle(custom)) return custom;
  return doodleAvatarUrl(seed, size);
}
