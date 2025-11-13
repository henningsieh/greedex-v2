import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "de"] as const;
const DEFAULT_LOCALE = "en";

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, qValue] = lang.trim().split(";");
      const quality = qValue ? parseFloat(qValue.split("=")[1]) : 1.0;
      return { locale: locale.split("-")[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (SUPPORTED_LOCALES.includes(locale as any)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. Check if locale is set in cookie (user preference)
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as any)) {
    return {
      locale: localeCookie,
      messages: (await import(`../../messages/${localeCookie}.json`)).default,
    };
  }

  // 2. Detect from Accept-Language header (browser language)
  const acceptLanguage = headersList.get("accept-language");
  const detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage);

  return {
    locale: detectedLocale,
    messages: (await import(`../../messages/${detectedLocale}.json`)).default,
  };
});
