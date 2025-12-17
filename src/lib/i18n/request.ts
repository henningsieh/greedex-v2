import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/config/Languages";
import { isSupportedLocale } from "@/lib/i18n/locales";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = (await requestLocale) ?? DEFAULT_LOCALE;

  // Ensure that the incoming locale is valid
  if (!isSupportedLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`@/lib/i18n/translations/${locale}.json`)).default,
  };
});
