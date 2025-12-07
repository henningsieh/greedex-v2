import { Comfortaa, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NuqsProvider } from "@/components/providers/nuqs-adapter";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { env } from "@/env";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { routing } from "@/lib/i18n/routing";
import { orpcQuery } from "@/lib/orpc/orpc";
import { getQueryClient, HydrateClient } from "@/lib/react-query/hydration";

const comfortaa = Comfortaa({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

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

  // Prefetch all data needed by client components that use useSuspenseQuery.
  // Using await ensures data is in cache BEFORE dehydration, preventing hydration mismatches.
  // Components that need this data: AppBreadcrumb, AppSidebar (ProjectSwitcher, OrganizationSwitcher), Navbar (UserSession)
  const queryClient = getQueryClient();
  const prefetches = [
    queryClient.prefetchQuery(orpcQuery.betterauth.getSession.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.projects.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.list.queryOptions()),
    queryClient.prefetchQuery(orpcQuery.organizations.getActive.queryOptions()),
  ];

  await Promise.all(prefetches);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${comfortaa.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable}`}
    >
      <head>
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
              <HydrateClient client={queryClient}>
                <NextIntlClientProvider messages={messages}>
                  {children}
                </NextIntlClientProvider>
              </HydrateClient>
            </QueryProvider>
          </NuqsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
