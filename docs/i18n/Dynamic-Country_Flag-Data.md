# Recommended Approach: Dynamic Country/Flag Data

### 1. **Install Required Libraries**

```bash
npm install country-flag-icons
npm install i18n-iso-countries
```

### 2. **Create a Dynamic Locale Configuration**

```typescript
// config/locales.ts
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import enCountries from 'i18n-iso-countries/langs/en.json';

// Register the country names
countries.registerLocale(enCountries);

// Define your supported locales with ISO country codes
export const SUPPORTED_LOCALES = [
  { locale: 'en', countryCode: 'GB' },
  { locale: 'de', countryCode: 'DE' },
  { locale: 'es', countryCode: 'ES' },
  { locale: 'pt', countryCode: 'PT' },
  { locale: 'fr', countryCode: 'FR' },
  { locale: 'pl', countryCode: 'PL' },
  { locale: 'sl', countryCode: 'SI' },
] as const;

// Generate locale data dynamically
export const getLocaleData = () => {
  return SUPPORTED_LOCALES.map(({ locale, countryCode }) => ({
    code: locale,
    countryCode,
    // @ts-ignore - Dynamic flag import
    Flag: Flags[countryCode],
    // Get native country name
    nativeName: countries.getName(countryCode, locale, { select: 'official' }) || countryCode,
    // Get English country name
    englishName: countries.getName(countryCode, 'en', { select: 'official' }) || countryCode,
  }));
};

export type LocaleData = ReturnType<typeof getLocaleData>[number];
```

### 3. **Language Switcher Component**

```tsx
// components/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { getLocaleData } from '@/config/locales';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Get all locale data dynamically
  const locales = getLocaleData();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {locales.map((loc) => {
        const FlagComponent = loc.Flag;
        
        return (
          <button
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            disabled={isPending || locale === loc.code}
            className={`flex items-center gap-2 px-3 py-2 rounded transition ${
              locale === loc.code 
                ? 'bg-green-600 text-white ring-2 ring-green-400' 
                : 'bg-gray-100 hover:bg-gray-200'
            } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            aria-label={`Switch to ${loc.englishName}`}
            title={loc.nativeName}
          >
            {FlagComponent && <FlagComponent className="w-6 h-4" />}
            <span className="text-sm font-medium">{loc.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### 4. **Integrate with next-intl Configuration**

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { SUPPORTED_LOCALES } from './config/locales';

// Extract just the locale codes
const locales = SUPPORTED_LOCALES.map(l => l.locale);

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Fallback to 'en' if not found or not supported
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

### 5. **Alternative: Dropdown Selector (More Compact)**

```tsx
// components/LanguageDropdown.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { getLocaleData } from '@/config/locales';

export default function LanguageDropdown() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const locales = getLocaleData();
  
  const currentLocale = locales.find(l => l.code === locale);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        className="px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.nativeName} ({loc.countryCode})
          </option>
        ))}
      </select>
      {currentLocale?.Flag && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <currentLocale.Flag className="w-5 h-4" />
        </div>
      )}
    </div>
  );
}
```

## Why This Approach?

✅ **Single source of truth** - Only define locale-to-country mapping once  
✅ **Automatic flag loading** - Flags pulled dynamically from library  
✅ **Automatic native names** - Country names generated in their native language  
✅ **Type-safe** - TypeScript knows all supported locales  
✅ **Easy to extend** - Add new language by adding one line to `SUPPORTED_LOCALES`  
✅ **EU-friendly** - Uses ISO country codes standard across EU  

## Benefits Over Manual Listing

- Add a new language? Just add `{ locale: 'it', countryCode: 'IT' }` - flag and name auto-populate
- Country names automatically translated
- Flags always consistent and high-quality
- No typos in flag emoji or manual data entry

This gives you the best of both worlds: next-intl's native functionality with dynamic, library-driven country/flag data! 🇪🇺