/**
 * @greendex/i18n
 * Internationalization configuration and utilities
 */

// Re-export configuration from @greendex/config
export {
  SUPPORTED_LOCALES,
  LOCALE_CODES,
  DEFAULT_LOCALE,
  type SupportedLocale,
  type LocaleCode,
} from "@greendex/config/languages";

// Export i18n configuration
export * from "./config";
