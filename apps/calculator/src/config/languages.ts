// Centralized i18n configuration
// This file contains all internationalization-related settings

/**
 * Supported locales configuration
 *
 * Note: "en" represents International English and is NOT tied to a specific EU country.
 * The countryCode is optional and only used when a locale directly represents an EU member state.
 */
export const SUPPORTED_LOCALES = [
  {
    code: "en",
    label: "English",
    displayRegion: "International",
    // No countryCode - International English is not tied to UK/GB (non-EU)
  },
  {
    code: "de",
    label: "Deutsch",
    displayRegion: "Deutschland",
    countryCode: "DE", // Germany is an EU member
  },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleCode = SupportedLocale["code"];

export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALES.map(
  (locale) => locale.code,
);

export const DEFAULT_LOCALE: LocaleCode = LOCALE_CODES[0];
