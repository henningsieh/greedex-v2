"use client";

import { NextIntlClientProvider } from "@greendex/i18n";

export function NextIntlProvider({ children }: { children: React.ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
