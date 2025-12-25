# Internationalization (i18n) Documentation

This folder contains documentation for internationalization features in the application.

## Overview

The application uses `next-intl` for translations and `i18n-iso-countries` with `country-flag-icons` for country data and flag display.

**Configuration Structure:**
- **Languages config**: `src/config/Languages.ts` - Defines supported locales (language codes, labels, display regions)
- **Locale utilities**: `src/lib/i18n/locales.ts` - Locale data with flags and country name resolution
- **EU countries config**: `src/config/eu-countries.ts` - Single source of truth for EU member states, capitals, and coordinates
- **Country i18n utilities**: `src/lib/i18n/countries.ts` - Internationalization wrappers for country data (localized names, flags)

## Documentation Files

### [file-organization.md](./file-organization.md)
**Complete guide to file structure and organization.** Clarifies the purpose and relationship between:
- `Languages.ts` vs `locales.ts`
- `eu-countries.ts` vs `countries.ts`
- Configuration files vs utility files
- Data flow and when to use which file

### [eu-countries-configuration.md](./eu-countries-configuration.md)
**Single source of truth** for EU countries, capitals, and coordinates. This central configuration serves:
- i18n localization (country codes, names)
- Globe visualization (coordinates, city markers)
- Country selection dropdowns
- Type-safe country code validation
- Marker size constants

### [next-intl.internationalization.md](./next-intl.internationalization.md)
Complete guide to the next-intl setup in this project, including:
- Server-side and client-side configuration
- Locale detection and message loading
- Usage in components
- Adding new languages

### [Country-Selection-Utils.md](./Country-Selection-Utils.md)
Documentation for country selection utilities, including:
- EU country listing with flags
- Country flag retrieval
- Country data lookup
- Usage examples in forms

### [Dynamic-Country_Flag-Data.md](./Dynamic-Country_Flag-Data.md)
Guide for the recommended approach to handling country and flag data dynamically.

## Key Features

### Language/Locale Support

The app currently supports:
- **English (en)** - Default locale
- **German (de)**

Locales are defined in `src/lib/i18n/locales.ts` and use ISO 3166-1 country codes for flag display.

### Country Selection

Country utilities are available in `src/lib/i18n/countries.ts`:

```typescript
import { getEUCountries, getCountryFlag, isEUCountry } from '@/lib/i18n/countries';

// Get all EU countries with flags and localized names
const euCountries = getEUCountries('en');

// Get a specific country's flag component
const GermanyFlag = getCountryFlag('DE');

// Check if a country is in the EU
const isEU = isEUCountry('DE'); // true
```

### Ready-to-Use Components

- **LocaleSwitcher** (`src/components/locale-switcher.tsx`): Language switcher with flags
- **CountrySelect** (`src/components/ui/country-select.tsx`): Country selector with flags and search

## Quick Start

### Using Country Selection in Forms

```tsx
import { CountrySelect } from '@/components/ui/country-select';

export function MyForm() {
  const [country, setCountry] = useState('');
  
  return (
    <CountrySelect
      value={country}
      onValueChange={setCountry}
      euOnly={true}
      placeholder="Select a country..."
    />
  );
}
```

### Using Translations

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('MyNamespace');
  
  return <h1>{t('title')}</h1>;
}
```

## File Locations

### Core Configuration
- **Languages config**: `src/config/Languages.ts` - Locale codes and display settings
- **EU countries config**: `src/config/eu-countries.ts` - Single source of truth for EU data

### i18n Utilities
- **Locale utilities**: `src/lib/i18n/locales.ts` - Locale data with flags
- **Country i18n utilities**: `src/lib/i18n/countries.ts` - Localized country names and flags
- **i18n routing**: `src/lib/i18n/request.ts` - Locale routing logic

### UI & Data
- **Translation messages**: `messages/` (en.json, de.json, etc.)
- **Locale switcher**: `src/components/locale-switcher.tsx`
- **Country select**: `src/components/ui/country-select.tsx`

## Testing

Tests for country utilities are in `src/__tests__/country-i18n.test.ts`. Run them with:

```bash
bun run test src/__tests__/country-i18n.test.ts
```

## Adding New Features

### Adding a New Language

Adding a new language to the application requires updates in several locations. Here's the complete step-by-step guide:

#### 1. **Update i18n Configuration** (`src/lib/i18n/config.ts`)
Add the new locale to the `SUPPORTED_LOCALES` array:

```typescript
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
  {
    code: "fr",        // New language
    label: "Français", // New language
    countryCode: "FR", // New language
  },
] as const;
```

#### 2. **Register Country Locale** (`src/lib/i18n/countries.ts`)
If the new language needs country name translations, register its locale data:

```typescript
import frCountries from "i18n-iso-countries/langs/fr.json";

// Register country locales for supported languages
countries.registerLocale(enCountries);
countries.registerLocale(deCountries);
countries.registerLocale(frCountries); // Add new language
```

#### 3. **Add Translation Messages** (`messages/` directory)
Create a new translation file for the language (e.g., `fr.json`):

```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "navigation": {
    "home": "Accueil"
  }
}
```

Copy the structure from existing language files (`en.json`, `de.json`) and translate all keys.

#### 4. **Update Locale Registration** (`src/lib/i18n/locales.ts`)
The locale registration is already handled automatically through the config import, but verify that the new locale appears in the locale switcher.

#### 5. **Test the Implementation**
- Run the application and verify the new language appears in the locale switcher
- Test that country selection works with the new locale
- Verify that all UI text is properly translated
- Run tests: `bun run test`

#### Files Modified When Adding a Language:
- ✅ `src/config/Languages.ts` - Add locale configuration
- ✅ `src/lib/i18n/countries.ts` - Register country locale (if needed)
- ✅ `messages/[locale].json` - Add translation file
- ✅ `src/lib/i18n/locales.ts` - Automatically updated via config import

#### Example: Adding French Support

1. **config.ts:**
```typescript
export const SUPPORTED_LOCALES = [
  // ... existing locales
  {
    code: "fr",
    label: "Français",
    countryCode: "FR",
  },
] as const;
```

2. **countries.ts:**
```typescript
import frCountries from "i18n-iso-countries/langs/fr.json";
countries.registerLocale(frCountries);
```

3. **messages/fr.json:**
```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

#### Notes:
- The `countryCode` should be the ISO 3166-1 alpha-2 code for the country representing the language
- Translation files must include all keys present in other language files
- Country flags are automatically available through the `country-flag-icons` library
- The locale switcher will automatically include the new language once added to config

## Best Practices

1. **Always use locale parameter**: Pass the current locale to country functions for localized names
2. **Use components**: Prefer `<CountrySelect>` over custom implementations
3. **Test with multiple locales**: Ensure features work in all supported languages
4. **Keep flags consistent**: Always use the Flag components from country utilities
5. **Sort alphabetically**: Country lists should be sorted by name in the user's locale

## Related Documentation

- [Next-intl Official Docs](https://next-intl-docs.vercel.app/)
- [i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries)
- [country-flag-icons](https://gitlab.com/catamphetamine/country-flag-icons)
