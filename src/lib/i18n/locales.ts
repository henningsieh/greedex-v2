import * as Flags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import type { ComponentType, SVGProps } from "react";

countries.registerLocale(enCountries);
countries.registerLocale(deCountries);

export const SUPPORTED_LOCALE_META = [
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

type LocaleMeta = (typeof SUPPORTED_LOCALE_META)[number];
export type LocaleCode = LocaleMeta["code"];

export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALE_META.map(
  (locale) => locale.code,
);

export const DEFAULT_LOCALE: LocaleCode = LOCALE_CODES[0];

export const isSupportedLocale = (
  value: string | undefined,
): value is LocaleCode => !!value && LOCALE_CODES.includes(value as LocaleCode);

export type LocaleData = LocaleMeta & {
  nativeName: string;
  englishName: string;
  Flag?: ComponentType<SVGProps<SVGSVGElement>>;
};

const flagRegistry = Flags as Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
>;

export const getLocaleData = (): LocaleData[] => {
  return SUPPORTED_LOCALE_META.map((locale) => {
    const nativeName =
      countries.getName(locale.countryCode, locale.code, {
        select: "official",
      }) ?? locale.label;

    let englishName =
      countries.getName(locale.countryCode, "en", {
        select: "official",
      }) ?? locale.label;

    if (englishName === `United Kingdom`) {
      englishName = `International`;
    }

    const Flag = flagRegistry[locale.countryCode];

    return {
      ...locale,
      nativeName,
      englishName,
      Flag,
    };
  });
};

