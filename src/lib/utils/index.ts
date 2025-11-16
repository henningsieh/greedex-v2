import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { authClient } from "@/lib/better-auth/auth-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transform a string into a URL-friendly slug.
 * - trims, lowercases
 * - replaces groups of non-alphanumeric characters with a single `-`
 * - collapses multiple `-` and trims leading/trailing `-`
 */
function slugify(input: string) {
  if (!input) return "";
  return (
    input
      .toString()
      .trim()
      .toLowerCase()
      // replace anything that's not a-z0-9 with -
      .replace(/[^a-z0-9]+/g, "-")
      // collapse multiple -
      .replace(/-+/g, "-")
      // remove leading/trailing -
      .replace(/^-|-$/g, "")
  );
}

/**
 * Generate a short random alphanumeric string (lowercase) of given length.
 */
function randomString(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Find an available slug by checking with the backend.
 * Appends random suffixes if needed, up to a max number of attempts.
 */
export const findAvailableSlug = async (baseName: string): Promise<string> => {
  const baseSlug = slugify(baseName) || randomString(6);
  let candidate = baseSlug;
  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      const { error } = await authClient.organization.checkSlug({
        slug: candidate,
      });

      // If no error, slug is available
      if (!error) {
        return candidate;
      }

      // Slug is taken, try another variant
      attempt++;
      candidate = `${baseSlug}-${randomString(4)}`;
    } catch (_err) {
      // If error is thrown, slug is likely taken
      attempt++;
      candidate = `${baseSlug}-${randomString(4)}`;
    }
  }

  // Fallback: use completely random slug
  return randomString(8);
};
