# EU Countries Configuration

This document describes the centralized EU countries configuration system that serves as the single source of truth for EU member states, their capitals, and coordinates.

## Overview

The EU countries configuration is a comprehensive data structure that eliminates redundancy between locale management and globe visualization components. It provides:

- Country codes (ISO 3166-1 alpha-2)
- Capital city names
- Geographic coordinates (latitude/longitude)
- Optional marker sizes for visualization
- Type-safe TypeScript definitions

## Location

**Central Configuration**: [src/config/eu-countries.ts](../../src/config/eu-countries.ts)

## Data Structure

```typescript
/**
 * Marker size constants for globe visualization
 */
export const MARKER_SIZE = {
  DEFAULT: 0.08,  // Standard size for most cities
  LARGE: 1.2,     // Emphasized size for major capitals
} as const;

/**
 * EU Country configuration type (derived from const array)
 */
export type EUCountryConfig = {
  code: string;           // ISO 3166-1 alpha-2 country code
  capital: string;        // Capital city name (English)
  latitude: number;       // Capital city latitude in decimal degrees
  longitude: number;      // Capital city longitude in decimal degrees
  markerSize: number;     // Marker size for globe visualization
};
```

## Usage

### 1. Importing Country Codes

```typescript
import { EU_COUNTRY_CODES, type EUCountryCode } from '@/config/eu-countries';

// EU_COUNTRY_CODES is an array of all 27 country codes
// ["AT", "BE", "BG", ...]

// EUCountryCode is a type-safe union type
const countryCode: EUCountryCode = "DE"; // ✅ Valid
const invalid: EUCountryCode = "US"; // ❌ Type error
```

### 2. Using the Full Configuration

```typescript
import { EU_COUNTRIES } from '@/config/eu-countries';

// Access all country data
EU_COUNTRIES.forEach(country => {
  console.log(`${country.capital} is the capital of ${country.code}`);
  console.log(`Located at: ${country.latitude}, ${country.longitude}`);
});
```

### 3. Getting Specific Country Data

```typescript
import { getEUCountryConfig } from '@/config/eu-countries';

const germany = getEUCountryConfig('DE');
if (germany) {
  console.log(germany.capital); // "Berlin"
  console.log(germany.latitude); // 52.52
}
```

### 4. Validating EU Membership

```typescript
import { isEUCountry } from '@/config/eu-countries';

isEUCountry('DE'); // true
isEUCountry('GB'); // false (post-Brexit)
isEUCountry('US'); // false
```

### 5. Getting Member Count

```typescript
import { EU_MEMBER_COUNT } from '@/config/eu-countries';

console.log(`There are ${EU_MEMBER_COUNT} EU member states`); // 27
```

## Integration Points

### i18n Localization

The configuration integrates with the i18n system in [src/lib/i18n/countries.ts](../../src/lib/i18n/countries.ts):

```typescript
import { EU_COUNTRY_CODES, type EUCountryCode } from '@/config/eu-countries';

// Re-exported for use in i18n contexts
export { EU_COUNTRY_CODES, type EUCountryCode };
```

**Note:** The file was renamed from `country-i18n.ts` to `countries.ts` to better reflect its purpose as the main country utilities file.

### Globe Visualization

The configuration powers the globe component via [src/config/eu-cities.ts](../../src/config/eu-cities.ts):

```typescript
import { EU_COUNTRIES } from './eu-countries';

export const EU_CAPITAL_CITIES: CityLocation[] = EU_COUNTRIES.map(country => ({
  name: country.capital,
  countryCode: country.code,
  latitude: country.latitude,
  longitude: country.longitude,
  size: country.markerSize,
}));
```

This derived data structure is used by the Globe component to display city markers.

### Landing Page

The landing page uses the member count for dynamic display:

```typescript
import { EU_MEMBER_COUNT } from '@/config/eu-countries';

<p>Greendex connects organizations across all {EU_MEMBER_COUNT} EU member states...</p>
```

## Special Considerations

### English Locale

The "en" locale represents **International English** and is NOT tied to a specific EU country:

- Used as the default fallback language
- Labeled as "English" with "International" as the display region
- Uses the UK flag (GB) in the UI as a visual indicator, but does not represent UK/GB country code
- UK/GB is NOT an EU member (post-Brexit)

This is configured in [src/config/Languages.ts](../../src/config/Languages.ts):

```typescript
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
```

### Supported Locales vs EU Countries

- **Locales**: Language configurations (currently "en" and "de")
- **EU Countries**: All 27 member states regardless of locale support
- A locale may have an associated `countryCode` if it represents an EU member state
- A locale without `countryCode` is international/region-neutral

## Adding New Countries (Future-Proofing)

If the EU expands or requirements change:

1. Add the new entry to `EU_COUNTRIES` in [src/config/eu-countries.ts](../../src/config/eu-countries.ts)
2. No other files need updating - the configuration is automatically consumed by all dependent systems
3. Run tests to verify: `bun run test`

Example:

```typescript
export const EU_COUNTRIES: readonly EUCountryConfig[] = [
  // ... existing countries
  { 
    code: "XY", 
    capital: "NewCity", 
    latitude: 50.0, 
    longitude: 10.0,
    markerSize: 1.0 // optional, for larger cities
  },
] as const;
```

## Marker Size Configuration

Marker sizes for globe visualization are centralized as constants:

```typescript
import { MARKER_SIZE } from '@/config/eu-countries';

// Use in configuration
{
  code: "DE",
  capital: "Berlin",
  markerSize: MARKER_SIZE.LARGE,  // Major capital
}

{
  code: "LU",
  capital: "Luxembourg",
  markerSize: MARKER_SIZE.DEFAULT,  // Standard city
}
```

This eliminates redundancy and provides a single point of control for marker sizes across the entire application.

## Testing

All country utilities are tested in [src/test/country-i18n.test.ts](../../src/test/country-i18n.test.ts):

- EU country count validation
- Flag component retrieval
- Locale-specific country names
- EU membership validation
- Country data retrieval

Run tests with:

```bash
bun run test
```

## Benefits

### Before (Redundant Configuration)

- EU country codes defined in `src/lib/i18n/countries.ts`
- EU capital cities with coordinates defined separately in `src/config/eu-cities.ts`
- Hard-coded "27" in landing page text and display
- Risk of inconsistency between data sources

### After (Single Source of Truth)

- ✅ One comprehensive configuration in `src/config/eu-countries.ts`
- ✅ Automatically derived data structures for specific use cases
- ✅ Type-safe country codes and validation
- ✅ Dynamic member count from configuration
- ✅ Easier maintenance and future updates
- ✅ Zero redundancy

## Related Documentation

- [Country Selection Utilities](./Country-Selection-Utils.md)
- [Internationalization](./next-intl.internationalization.md)
- [Dynamic Country Flag Data](./Dynamic-Country_Flag-Data.md)
