/**
 * Comprehensive EU Countries Configuration
 * Single source of truth for EU member states, their capitals, and coordinates
 *
 * This configuration serves:
 * - i18n localization (country codes, names)
 * - Globe visualization (coordinates, city markers)
 * - Country selection dropdowns
 *
 * Updated as of 2024 - 27 EU member states
 */

/**
 * Marker size constants for globe visualization
 * DEFAULT: Standard size for most cities
 * LARGE: Emphasized size for major capitals
 */
export const MARKER_SIZE = {
  DEFAULT: 0.08,
  LARGE: 1.2,
} as const;

/**
 * Comprehensive list of all 27 EU member states with their capitals and coordinates
 * Sorted alphabetically by country code for easy reference
 *
 * Using `as const` to preserve literal types for type-safe country code validation
 */
export const EU_COUNTRIES = [
  {
    code: "AT",
    capital: "Vienna",
    latitude: 48.2082,
    longitude: 16.3738,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "BE",
    capital: "Brussels",
    latitude: 50.8503,
    longitude: 4.3517,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "BG",
    capital: "Sofia",
    latitude: 42.6977,
    longitude: 23.3219,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "HR",
    capital: "Zagreb",
    latitude: 45.815,
    longitude: 15.9819,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "CY",
    capital: "Nicosia",
    latitude: 35.1856,
    longitude: 33.3823,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "CZ",
    capital: "Prague",
    latitude: 50.0755,
    longitude: 14.4378,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "DK",
    capital: "Copenhagen",
    latitude: 55.6761,
    longitude: 12.5683,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "EE",
    capital: "Tallinn",
    latitude: 59.437,
    longitude: 24.7536,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "FI",
    capital: "Helsinki",
    latitude: 60.1699,
    longitude: 24.9384,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "FR",
    capital: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    markerSize: MARKER_SIZE.LARGE,
  },
  {
    code: "DE",
    capital: "Berlin",
    latitude: 52.52,
    longitude: 13.405,
    markerSize: MARKER_SIZE.LARGE,
  },
  {
    code: "GR",
    capital: "Athens",
    latitude: 37.9838,
    longitude: 23.7275,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "HU",
    capital: "Budapest",
    latitude: 47.4979,
    longitude: 19.0402,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "IE",
    capital: "Dublin",
    latitude: 53.3498,
    longitude: -6.2603,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "IT",
    capital: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    markerSize: MARKER_SIZE.LARGE,
  },
  {
    code: "LV",
    capital: "Riga",
    latitude: 56.9496,
    longitude: 24.1052,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "LT",
    capital: "Vilnius",
    latitude: 54.6872,
    longitude: 25.2797,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "LU",
    capital: "Luxembourg",
    latitude: 49.6116,
    longitude: 6.1319,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "MT",
    capital: "Valletta",
    latitude: 35.8989,
    longitude: 14.5146,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "NL",
    capital: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "PL",
    capital: "Warsaw",
    latitude: 52.2297,
    longitude: 21.0122,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "PT",
    capital: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "RO",
    capital: "Bucharest",
    latitude: 44.4268,
    longitude: 26.1025,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "SK",
    capital: "Bratislava",
    latitude: 48.1486,
    longitude: 17.1077,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "SI",
    capital: "Ljubljana",
    latitude: 46.0569,
    longitude: 14.5058,
    markerSize: MARKER_SIZE.DEFAULT,
  },
  {
    code: "ES",
    capital: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    markerSize: MARKER_SIZE.LARGE,
  },
  {
    code: "SE",
    capital: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    markerSize: MARKER_SIZE.DEFAULT,
  },
] as const;

/**
 * Array of EU country codes only
 * Useful for type definitions and validation
 */
export const EU_COUNTRY_CODES = EU_COUNTRIES.map((country) => country.code);

/**
 * Type-safe EU country code (literal union of all valid codes)
 */
export type EUCountryCode = (typeof EU_COUNTRIES)[number]["code"];

/**
 * Type for EU country configuration entries
 */
export type EUCountryConfig = (typeof EU_COUNTRIES)[number];

/**
 * Get EU country configuration by country code
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns EU country configuration or undefined if not found
 */
export const getEUCountryConfig = (
  countryCode: string,
): EUCountryConfig | undefined => {
  const code = countryCode.toUpperCase();
  return EU_COUNTRIES.find((country) => country.code === code);
};

/**
 * Check if a country code is an EU member state
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns true if the country is an EU member state
 */
export const isEUCountry = (countryCode: string): boolean => {
  const code = countryCode.toUpperCase();
  return EU_COUNTRIES.some((country) => country.code === code);
};

/**
 * Get total count of EU member states
 */
export const EU_MEMBER_COUNT = EU_COUNTRIES.length;
