# Config registry

This folder exposes a central registry of application configuration data.

Usage:
- Import frequently used settings from a single source:
  `import { DEFAULT_LOCALE, LOCALE_CODES, PROJECT_SORT_FIELDS, DEFAULT_PROJECT_SORTING_FIELD } from '@/lib/config/registry';`

Notes:
- The registry re-exports the `app` route constants and `i18n` locale helpers.
- Domain-specific logic (e.g., locale lists or route definitions) remains in their domain modules (`src/lib/i18n/locales.ts`, `src/lib/config/app.ts`) and is re-exported via registry for convenience and centralization.
- Keep `registry.ts` lightweight; prefer leaving source-of-truth logic in domain modules.
