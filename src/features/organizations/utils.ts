import { authClient } from "@/lib/better-auth/auth-client";

/**
 * Default length for random strings used in slug generation.
 */
const DEFAULT_RANDOM_STRING_LENGTH = 6;

/**
 * Length for random suffix when slug collision occurs.
 */
const SLUG_SUFFIX_LENGTH = 4;

/**
 * Length for fallback random slug when max attempts are reached.
 */
const FALLBACK_SLUG_LENGTH = 8;

/**
 * Maximum number of attempts to find an available slug before using a random fallback.
 */
const MAX_SLUG_ATTEMPTS = 10;

/**
 * Characters allowed in random string generation (lowercase alphanumeric).
 */
const RANDOM_STRING_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Transform a string into a URL-friendly slug.
 * - trims, lowercases
 * - replaces groups of non-alphanumeric characters with a single `-`
 * - collapses multiple `-` and trims leading/trailing `-`
 */
function slugify(input: string) {
  if (!input) {
    return "";
  }

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
function randomString(length = DEFAULT_RANDOM_STRING_LENGTH) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out +=
      RANDOM_STRING_CHARS[
        Math.floor(Math.random() * RANDOM_STRING_CHARS.length)
      ];
  }
  return out;
}

/**
 * Find an available slug by checking with the backend.
 * Appends random suffixes if needed, up to a max number of attempts.
 */
export const findAvailableSlug = async (baseName: string): Promise<string> => {
  const baseSlug =
    slugify(baseName) || randomString(DEFAULT_RANDOM_STRING_LENGTH);
  let candidate = baseSlug;
  let attempt = 0;

  while (attempt < MAX_SLUG_ATTEMPTS) {
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
      candidate = `${baseSlug}-${randomString(SLUG_SUFFIX_LENGTH)}`;
    } catch (_err) {
      // If error is thrown, slug is likely taken
      attempt++;
      candidate = `${baseSlug}-${randomString(SLUG_SUFFIX_LENGTH)}`;
    }
  }

  // Fallback: use completely random slug
  return randomString(FALLBACK_SLUG_LENGTH);
};
