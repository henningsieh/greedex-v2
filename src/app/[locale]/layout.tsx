import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Comfortaa, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { NuqsProvider } from "@/components/providers/nuqs-adapter";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { env } from "@/env";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { routing } from "@/lib/i18n/routing";

const comfortaa = Comfortaa({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

interface Props {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      className={`${comfortaa.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable} scroll-smooth`}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD structured data for SEO */}
        <JsonLd />
        {/* Preconnect to external resources for performance */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="/favicon/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/favicon/site.webmanifest" rel="manifest" />
        {env.NODE_ENV === "development" && (
          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        )}
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <NuqsProvider>
            <QueryProvider>
              <NextIntlClientProvider messages={messages}>
                {children}
              </NextIntlClientProvider>
            </QueryProvider>
          </NuqsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
