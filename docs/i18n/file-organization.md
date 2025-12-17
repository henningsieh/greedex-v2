# i18n and Country Configuration File Organization

This document clarifies the purpose and relationship between the various configuration and utility files.

## File Structure Overview

```
src/
├── config/
│   ├── Languages.ts          # Locale configuration (language codes, labels)
│   ├── eu-countries.ts        # EU countries data (single source of truth)
│   └── eu-cities.ts           # Derived city data for globe visualization
│
└── lib/i18n/
    ├── locales.ts             # Locale utilities (flag resolution, locale data)
    └── countries.ts           # Country i18n utilities (localized names, flags)
```

## File Purposes

### Core Configuration Files (`src/config/`)

#### `Languages.ts`
**Purpose:** Defines supported locales and their metadata.

**Contains:**
- Locale codes (`"en"`, `"de"`)
- Display labels (`"English"`, `"Deutsch"`)
- Display regions (`"International"`, `"Deutschland"`)
- Optional country codes for EU-tied locales

**Example:**
```typescript
export const SUPPORTED_LOCALES = [
  {
    code: "en",
    label: "English",
    displayRegion: "International",
    // No countryCode - International English
  },
  {
    code: "de",
    label: "Deutsch",
    displayRegion: "Deutschland",
    countryCode: "DE",
  },
] as const;
```

**Used by:** Locale switcher, routing, translation loading

---

#### `eu-countries.ts`
**Purpose:** Single source of truth for all EU member states.

**Contains:**
- Country codes (ISO 3166-1 alpha-2)
- Capital city names
- Geographic coordinates
- Marker sizes for visualization
- Utility functions for country lookups

**Key Features:**
- Type-safe country codes (`EUCountryCode`)
- Marker size constants (`MARKER_SIZE.DEFAULT`, `MARKER_SIZE.LARGE`)
- Validation functions (`isEUCountry`)
- Country configuration lookup (`getEUCountryConfig`)

**Example:**
```typescript
export const MARKER_SIZE = {
  DEFAULT: 0.08,
  LARGE: 1.2,
} as const;

export const EU_COUNTRIES = [
  { code: "DE", capital: "Berlin", latitude: 52.52, longitude: 13.405, markerSize: MARKER_SIZE.LARGE },
  { code: "AT", capital: "Vienna", latitude: 48.2082, longitude: 16.3738, markerSize: MARKER_SIZE.DEFAULT },
  // ... all 27 EU countries
] as const;
```

**Used by:** Globe visualization, country selection, i18n utilities, validation

---

#### `eu-cities.ts`
**Purpose:** Derived data structure for globe visualization.

**Contains:**
- `EU_CAPITAL_CITIES` - Mapped from `EU_COUNTRIES`
- Helper functions for filtering cities by region
- City subset utilities for testing

**Key Feature:**
- Automatically derived from `eu-countries.ts` to maintain single source of truth

**Example:**
```typescript
export const EU_CAPITAL_CITIES: CityLocation[] = EU_COUNTRIES.map((country) => ({
  name: country.capital,
  countryCode: country.code,
  latitude: country.latitude,
  longitude: country.longitude,
  size: country.markerSize,
}));
```

**Used by:** Globe component, map visualizations

---

### i18n Utility Files (`src/lib/i18n/`)

#### `locales.ts`
**Purpose:** Provides locale data enriched with flags and country names.

**Contains:**
- `getLocaleData()` - Combines locale config with flag components
- Locale type guards (`isSupportedLocale`)
- Re-exports of locale types

**Key Features:**
- Resolves flags for locales with country codes
- Uses UK flag for International English as visual indicator
- Combines `i18n-iso-countries` with `country-flag-icons`

**Example:**
```typescript
export const getLocaleData = (): LocaleData[] => {
  return SUPPORTED_LOCALES.map((locale) => {
    const countryCode = "countryCode" in locale ? locale.countryCode : undefined;
    // ... resolve flag and names
    return { ...locale, nativeName, englishName, Flag };
  });
};
```

**Used by:** Locale switcher component

---

#### `countries.ts`
**Purpose:** Internationalization utilities for country data (formerly `country-i18n.ts`).

**Contains:**
- `getEUCountries(locale)` - Get EU countries with localized names
- `getCountryFlag(code)` - Get flag component for any country
- `getCountryData(code, locale)` - Get localized country information
- `getAllCountries(locale)` - Get all countries (not just EU) with localized names
- Re-exports of EU country codes and types

**Key Features:**
- Wraps `eu-countries.ts` with i18n capabilities
- Uses `i18n-iso-countries` for name translations
- Provides flag components from `country-flag-icons`
- Alphabetically sorts countries by locale

**Example:**
```typescript
import { getEUCountries, getCountryFlag } from '@/lib/i18n/countries';

// Get countries with German names
const countries = getEUCountries('de');
// Returns: [{ code: "AT", name: "Österreich", Flag: AustriaFlag }, ...]

// Get a flag component
const Flag = getCountryFlag('DE');
```

**Used by:** Country selection dropdowns, forms, country display components

---

## Naming Rationale

### Why `Languages.ts` (not `locales.ts`)?
- Sits in `/config/` as core configuration data
- Defines **language** settings and metadata
- More intuitive for developers adding new languages

### Why `countries.ts` (not `country-i18n.ts`)?
- Clarifies it's the **main country utilities file**, not just i18n
- More intuitive and shorter filename
- Contains all country-related functions including validation and data access

### Why `eu-countries.ts` (not `countries.ts`)?
- Explicitly shows it's **EU-specific** data
- Contains the **single source of truth** for EU member states
- Sits in `/config/` as core configuration data

### Why `locales.ts` still exists?
- Provides **locale utilities** (not configuration)
- Enriches locale data with flags and names
- Bridges between `Languages.ts` config and UI components

---

## Data Flow

```
┌─────────────────┐
│  Languages.ts   │ ← Defines locale codes and metadata
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   locales.ts    │ ← Enriches with flags and country names
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│ LocaleSwitcher.tsx  │ ← Displays language options to user
└─────────────────────┘
```

```
┌──────────────────┐
│ eu-countries.ts  │ ← Single source of truth for EU data
└────────┬─────────┘
         │
         ├──────────────────────────────┐
         ↓                              ↓
┌─────────────────┐          ┌─────────────────────┐
│  eu-cities.ts   │          │    countries.ts    │
│ (Globe data)    │          │  (i18n utilities)  │
└────────┬────────┘          └──────────┬──────────┘
         │                              │
         ↓                              ↓
┌─────────────────┐          ┌─────────────────────┐
│  Globe.tsx      │          │ CountrySelect.tsx  │
└─────────────────┘          └─────────────────────┘
```

---

## When to Use Which File

### Adding a new language?
→ Edit `Languages.ts` and optionally register locale in `countries.ts`

### Need localized country names in a dropdown?
→ Use `getEUCountries(locale)` from `countries.ts`

### Building a globe visualization?
→ Use `EU_CAPITAL_CITIES` from `eu-cities.ts`

### Need to validate if a country is in the EU?
→ Use `isEUCountry(code)` from `eu-countries.ts`

### Want to change marker sizes on the globe?
→ Edit `MARKER_SIZE` constants in `eu-countries.ts`

### Building a locale switcher?
→ Use `getLocaleData()` from `locales.ts`

---

## Benefits of This Organization

1. **Clear Separation of Concerns**
   - Configuration vs. utilities
   - Core data vs. derived data
   - i18n wrappers vs. raw data

2. **Single Source of Truth**
   - All EU country data in one place
   - Marker sizes as constants
   - Locale definitions centralized

3. **Type Safety**
   - Type-safe country codes
   - Literal types preserved with `as const`
   - Compile-time validation

4. **Easy Maintenance**
   - Update one file, changes propagate
   - Clear file purposes reduce confusion
   - Logical grouping by domain

5. **Developer Experience**
   - Intuitive file names
   - Clear import paths
   - Well-documented purposes

---

## Migration Notes

### Breaking Changes
- `src/lib/i18n/country-i18n.ts` → `src/lib/i18n/countries.ts`
- `src/__tests__/country-i18n.test.ts` → `src/__tests__/countries.test.ts` (if renamed)

### Update Imports
```typescript
// OLD
import { getEUCountries } from '@/lib/i18n/country-i18n';

// NEW
import { getEUCountries } from '@/lib/i18n/countries';
```

All existing functionality remains the same - only the file name changed for clarity.
