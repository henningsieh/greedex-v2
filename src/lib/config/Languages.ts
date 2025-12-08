// Centralized i18n configuration
// This file contains all internationalization-related settings

export const SUPPORTED_LOCALES = [
  {
    code: "en",
    label: "English",
    countryCode: "GB",
  },
  {
    code: "de",
    label: "Deutsch",
    countryCode: "DE",
  },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleCode = SupportedLocale["code"];

export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALES.map(
  (locale) => locale.code,
);

export const DEFAULT_LOCALE: LocaleCode = LOCALE_CODES[0];

export const isSupportedLocale = (
  value: string | undefined,
): value is LocaleCode => !!value && LOCALE_CODES.includes(value as LocaleCode);
