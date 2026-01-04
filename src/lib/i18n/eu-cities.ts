import { EU_COUNTRIES } from "../../config/eu-countries";

/**
 * EU Capital Cities with coordinates
 * Used for the Globe component to highlight EU member states
 *
 * This is now derived from the central EU_COUNTRIES configuration
 * to maintain a single source of truth.
 */

export interface CityLocation {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  size?: number; // Optional size for marker differentiation
}

/**
 * Capital cities of EU member states with their coordinates
 * Coordinates are in decimal degrees format
 *
 * Derived from the central EU_COUNTRIES configuration
 */
export const EU_CAPITAL_CITIES: CityLocation[] = EU_COUNTRIES.map(
  (country) => ({
    name: country.capital,
    countryCode: country.code,
    latitude: country.latitude,
    longitude: country.longitude,
    size: country.markerSize,
  }),
);

/**
 * Return the first `limit` EU capital cities, or all cities when `limit` is not provided or not greater than zero.
 *
 * @param limit - Maximum number of cities to include from the start of the list
 * @returns An array of `CityLocation` objects containing up to `limit` entries; the full `EU_CAPITAL_CITIES` array if `limit` is omitted or not greater than zero
 */
export function getEUCitiesSubset(limit?: number): CityLocation[] {
  if (limit && limit > 0) {
    return EU_CAPITAL_CITIES.slice(0, limit);
  }

  return EU_CAPITAL_CITIES;
}

/**
 * Get cities by region (approximation based on longitude)
 */
export function getEUCitiesByRegion(
  region: "west" | "central" | "east",
): CityLocation[] {
  switch (region) {
    case "west":
      return EU_CAPITAL_CITIES.filter((city) => city.longitude < 5);
    case "central":
      return EU_CAPITAL_CITIES.filter(
        (city) => city.longitude >= 5 && city.longitude < 20,
      );
    case "east":
      return EU_CAPITAL_CITIES.filter((city) => city.longitude >= 20);
    default:
      return EU_CAPITAL_CITIES;
  }
}