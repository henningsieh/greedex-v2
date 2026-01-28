import { getTranslations } from "@greendex/i18n/server";

import {
  ABOUT_PATH,
  DASHBOARD_PATH,
  E_FOREST_PATH,
  HOME_PATH,
  LIBRARY_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  TIPS_AND_TRICKS_PATH,
  WORKSHOPS_ANCHOR,
} from "@/app/routes";
import { AnimatedGradientCTA } from "@/features/landingpage/components/animated-cta";
import { Logo } from "@/features/landingpage/components/logo";
import { Link } from "@/lib/i18n/routing";

/**
 * Renders the site's footer section with the logo, a launch CTA, and localized navigation columns.
 *
 * Uses translations from "LandingPage" and "header" to populate link titles and builds the Explore, Company,
 * and App link groups. Also includes a CTA to the dashboard and a copyright line with the current year.
 *
 * @returns A JSX element representing the footer containing the logo, CTA, localized navigation links, and copyright.
 */
export default async function FooterSection() {
  const t = await getTranslations("landingpage");

  const navigationLinks = [
    {
      title: t("header.navigation.workshops"),
      href: WORKSHOPS_ANCHOR,
    },
    {
      title: t("header.navigation.eforest"),
      href: E_FOREST_PATH,
    },
    {
      title: t("header.navigation.tipsAndTricks"),
      href: TIPS_AND_TRICKS_PATH,
    },
    {
      title: t("header.navigation.library"),
      href: LIBRARY_PATH,
    },
  ];

  const companyLinks = [
    {
      title: t("header.navigation.about"),
      href: ABOUT_PATH,
    },
  ];

  const appLinks = [
    {
      title: t("header.navigation.login"),
      href: LOGIN_PATH,
    },
    {
      title: t("header.navigation.signup"),
      href: SIGNUP_PATH,
    },
  ];

  return (
    <footer className="border-t bg-background pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              aria-label="GREENDEX home"
              className="block size-fit"
              href={HOME_PATH}
            >
              <Logo />
            </Link>
            <div className="mt-8">
              <Link
                aria-label={t("launchButtonAria")}
                className="inline-block"
                href={DASHBOARD_PATH}
                title={t("launchButtonAria")}
              >
                <AnimatedGradientCTA leftEmoji={"🌳"}>
                  {t("launchButton")}
                </AnimatedGradientCTA>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            <div className="space-y-4 text-sm">
              <span className="block font-semibold text-foreground">
                {t("footer.explore")}
              </span>
              <div className="flex flex-col space-y-3">
                {navigationLinks.map((item, index) => (
                  <Link
                    className="text-muted-foreground transition-colors hover:text-primary"
                    href={item.href}
                    key={index}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <span className="block font-semibold text-foreground">
                {t("footer.company")}
              </span>
              <div className="flex flex-col space-y-3">
                {companyLinks.map((item, index) => (
                  <Link
                    className="text-muted-foreground transition-colors hover:text-primary"
                    href={item.href}
                    key={index}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <span className="block font-semibold text-foreground">
                {t("footer.app")}
              </span>
              <div className="flex flex-col space-y-3">
                {appLinks.map((item, index) => (
                  <Link
                    className="text-muted-foreground transition-colors hover:text-primary"
                    href={item.href}
                    key={index}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <span className="text-center text-sm text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} Greendex | {t("footer.copyright")}
          </span>
        </div>
      </div>
    </footer>
  );
}
