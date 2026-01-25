/**
 * EU Countries types
 * Type definitions for EU member states
 */

/**
 * ISO 3166-1 alpha-2 codes for all 27 EU member states
 */
export const EU_COUNTRY_CODES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE"
] as const;

/**
 * Type-safe EU country code (literal union of all valid codes)
 */
export type EUCountryCode = (typeof EU_COUNTRY_CODES)[number];

/**
 * EU country configuration entry
 */
export interface EUCountryConfig {
  code: EUCountryCode;
  capital: string;
  latitude: number;
  longitude: number;
  markerSize: number;
}
