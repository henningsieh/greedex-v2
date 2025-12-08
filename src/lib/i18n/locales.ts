import * as Flags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import type { ComponentType, SVGProps } from "react";
import { SUPPORTED_LOCALES, type SupportedLocale } from "../config/Languages";

countries.registerLocale(enCountries);
countries.registerLocale(deCountries);

// Re-export for backward compatibility
export type { LocaleCode } from "../config/Languages";
export {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_CODES,
} from "../config/Languages";

export type LocaleData = SupportedLocale & {
  nativeName: string;
  englishName: string;
  Flag?: ComponentType<SVGProps<SVGSVGElement>>;
};

const flagRegistry = Flags as Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
>;

export const getLocaleData = (): LocaleData[] => {
  return SUPPORTED_LOCALES.map((locale) => {
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
