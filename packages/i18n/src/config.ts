/**
 * i18n configuration
 * Shared locale configuration for the monorepo
 */

import {
  SUPPORTED_LOCALES,
  LOCALE_CODES,
  DEFAULT_LOCALE,
} from "@greendex/config/languages";

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): boolean {
  return LOCALE_CODES.includes(locale as any);
}

/**
 * Get the supported locales
 */
export const supportedLocales = SUPPORTED_LOCALES;

/**
 * Get locale codes
 */
export const localeCodes = LOCALE_CODES;

/**
 * Get the default locale
 */
export const defaultLocale = DEFAULT_LOCALE;
