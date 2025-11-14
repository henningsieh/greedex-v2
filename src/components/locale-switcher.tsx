"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/lib/i18n/routing";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: string) {
    startTransition(() => {
      // The router from next-intl automatically handles locale switching
      // It will navigate to the same page with the new locale prefix
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <div className="fixed top-4 right-4 z-50 rounded-lg border bg-background p-3 shadow-lg">
      <label htmlFor="locale-select" className="mb-2 block font-medium text-sm">
        Language / Sprache
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
      {isPending && (
        <p className="mt-1 text-muted-foreground text-xs">Switching...</p>
      )}
    </div>
  );
}
