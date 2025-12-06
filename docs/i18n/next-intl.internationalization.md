# Next.js Internationalization with next-intl

This guide explains how internationalization (i18n) is implemented in this Next.js project using the `next-intl` library.

## Overview

The project uses `next-intl` for handling multiple languages, allowing the application to support different locales seamlessly. Currently supported locales are English (`en`) and German (`de`), with English as the default.

## File Structure

- `messages/`: Contains JSON files for each locale (e.g., `en.json`, `de.json`)
- `src/i18n/request.ts`: Server-side configuration for locale detection and message loading
- Components use `useTranslations` hook from `next-intl` for client-side translations

## Server-Side Configuration

The `src/i18n/request.ts` file handles locale detection and message loading:

```typescript
// Priority order for locale detection:
// 1. Cookie (user preference)
// 2. Accept-Language header (browser language)
// 3. Default to 'en'
```

## Usage in Components

### Client Components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('LandingPage');

  return (
    <div>
      <h1>{t('hero.missionTitle')}</h1>
      <p>{t('hero.missionText')}</p>
    </div>
  );
}
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export async function MyServerComponent() {
  const t = await getTranslations('LandingPage');

  return (
    <div>
      <h1>{t('hero.missionTitle')}</h1>
      <p>{t('hero.missionText')}</p>
    </div>
  );
}
```

## Message Structure

Messages are organized in a nested JSON structure:

```json
{
  "LandingPage": {
    "launchButton": "Launch Erasmus+ Carbon Calculator",
    "hero": {
      "missionTitle": "Our mission",
      "missionText": "..."
    }
  }
}
```

## Adding New Languages

1. Create a new JSON file in `messages/` (e.g., `fr.json`)
2. Add the locale to `SUPPORTED_LOCALES` in `src/i18n/request.ts`
3. Update any locale switching components if needed

## Best Practices

- Use descriptive keys that reflect the content's purpose
- Keep messages organized by page/component
- Use interpolation for dynamic content: `{t('greeting', { name: user.name })}`
- Test translations in different locales during development

## Integration with Next.js

The setup uses Next.js App Router with `getRequestConfig` from `next-intl/server` to provide locale and messages to each request. This ensures proper SSR and static generation support.