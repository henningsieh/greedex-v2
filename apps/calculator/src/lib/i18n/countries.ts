import type { ComponentType, SVGProps } from "react";

import * as Flags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";

// Register country locales for supported languages
countries.registerLocale(enCountries);
countries.registerLocale(deCountries);

import {
  EU_COUNTRY_CODES,
  isEUCountry as isEUCountryBase,
} from "@greendex/config/eu-countries";

export interface CountryData {
  code: string;
  name: string;
  nativeName: string;
  Flag?: ComponentType<SVGProps<SVGSVGElement>>;
}

const flagRegistry = Flags as Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
>;

/**
 * Get the flag component for a given country code
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "DE", "FR")
 * @returns Flag component or undefined if not found
 */
export const getCountryFlag = (
  countryCode: string,
): ComponentType<SVGProps<SVGSVGElement>> | undefined => {
  const code = countryCode.toUpperCase();
  return flagRegistry[code];
};

/**
 * Get a list of EU countries with their flags and names
 * @param locale The locale code for country names (e.g., "en", "de")
 * @returns Array of country data objects with code, name, nativeName, and Flag component
 */
export const getEUCountries = (locale = "en"): CountryData[] => {
  return EU_COUNTRY_CODES.map((code) => {
    // Get country name in the requested locale
    const name =
      countries.getName(code, locale, { select: "official" }) ||
      countries.getName(code, "en", { select: "official" }) ||
      code;

    // Get country name in its native language
    // For this, we try to get the name in the country's primary language
    // This is a simplification; ideally we'd map country codes to their primary language
    const nativeName =
      countries.getName(code, locale, { select: "official" }) || name;

    const Flag = flagRegistry[code];

    return {
      code,
      name,
      nativeName,
      Flag,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, locale));
};

/**
 * Get country data for a specific country code
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @param locale The locale code for country name (default: "en")
 * @returns Country data object or undefined if not found
 */
export const getCountryData = (
  countryCode: string,
  locale = "en",
): CountryData | undefined => {
  const code = countryCode.toUpperCase();

  const name = countries.getName(code, locale, { select: "official" });
  if (!name) {
    return undefined;
  }

  const nativeName =
    countries.getName(code, locale, { select: "official" }) || name;
  const Flag = flagRegistry[code];

  return {
    code,
    name,
    nativeName,
    Flag,
  };
};

/**
 * Check if a country code is an EU member state
 * Re-exported from central configuration
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns true if the country is an EU member state
 */
export const isEUCountry = isEUCountryBase;

// UNUSED: getDefaultEUCountry
// /**
//  * Get the default EU country code for forms and UI elements
//  * Since locales are no longer tied to specific countries, this returns
//  * the first available EU country from supported locales, or Germany as fallback.
//  *
//  * @returns A valid EU country code
//  */
// export const getDefaultEUCountry = (): EUCountryCode => {
//   // Try to find a locale with a country code that's in the EU
//   const localeWithEUCountry = SUPPORTED_LOCALES.find(
//     (locale) =>
//       "countryCode" in locale && isEUCountry(locale.countryCode as string),
//   );

//   if (localeWithEUCountry && "countryCode" in localeWithEUCountry) {
//     return localeWithEUCountry.countryCode as EUCountryCode;
//   }

//   // Fallback to Germany (first EU country in the list)
//   return "DE";
// };

/**
 * Get all available countries (not just EU) with their flags
 * @param locale The locale code for country names (default: "en")
 * @returns Array of all country data objects
 */
export const getAllCountries = (locale = "en"): CountryData[] => {
  const allCountryCodes = Object.keys(countries.getAlpha2Codes());

  return allCountryCodes
    .map((code) => {
      const name =
        countries.getName(code, locale, { select: "official" }) ||
        countries.getName(code, "en", { select: "official" }) ||
        code;

      const nativeName =
        countries.getName(code, locale, { select: "official" }) || name;

      const Flag = flagRegistry[code];

      return {
        code,
        name,
        nativeName,
        Flag,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale));
};
