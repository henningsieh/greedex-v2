/**
 * Utility functions for email handling.
 */

/**
 * Masks an email address for logging purposes to protect user privacy.
 * Replaces most of the local part with asterisks, keeping only the first character and domain.
 * @param email - The email address to mask.
 * @returns The masked email, e.g., "j***@example.com".
 */
export function maskEmail(email?: string): string {
  if (!email) return email || "";
  const [local, domain] = String(email).split("@");
  if (!domain) return email;
  const firstChar = local?.[0] || "";
  return `${firstChar}***@${domain}`;
}
