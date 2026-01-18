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
 *
 * @returns The slugified string: lowercase, with groups of non-alphanumeric characters replaced by a single `-`, consecutive `-` collapsed, and leading/trailing `-` removed. Returns an empty string for falsy input.
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
  return Array.from(
    { length },
    () =>
      RANDOM_STRING_CHARS[Math.floor(Math.random() * RANDOM_STRING_CHARS.length)],
  ).join("");
}

/**
 * Check if a slug is available.
 */
async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    const { error } = await authClient.organization.checkSlug({ slug });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Recursively find an available slug by checking with the backend.
 */
async function trySlug(baseSlug: string, attempt: number): Promise<string> {
  if (attempt >= MAX_SLUG_ATTEMPTS) {
    return randomString(FALLBACK_SLUG_LENGTH);
  }

  const candidate =
    attempt === 0 ? baseSlug : `${baseSlug}-${randomString(SLUG_SUFFIX_LENGTH)}`;

  if (await isSlugAvailable(candidate)) {
    return candidate;
  }

  return trySlug(baseSlug, attempt + 1);
}

/**
 * Find an available slug by checking with the backend.
 * Appends random suffixes if needed, up to a max number of attempts.
 */
export const findAvailableSlug = async (baseName: string): Promise<string> => {
  const baseSlug =
    slugify(baseName) || randomString(DEFAULT_RANDOM_STRING_LENGTH);
  return trySlug(baseSlug, 0);
};
