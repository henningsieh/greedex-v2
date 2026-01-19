import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";

import { AnimatedGroup } from "@/components/animated-group";
import { BackgroundAnimations } from "@/components/background-animations";
import { BackToHome } from "@/components/features/authentication/back-to-home";
import { RightSideImage } from "@/components/features/authentication/right-side-image";
import { cn } from "@/lib/utils";

const highlightKeys = ["one", "two", "three"] as const;

interface AuthFlowLayoutProps {
  children: ReactNode;
  backLabel?: string;
  backHref?: string;
}

export function normalizeRedirectPath(
  nextPageUrl: string | string[] | undefined,
  fallbackPath: string,
): string {
  let normalizedRedirect: string | undefined;
  if (typeof nextPageUrl === "string") {
    normalizedRedirect = nextPageUrl;
  } else if (Array.isArray(nextPageUrl)) {
    normalizedRedirect = nextPageUrl[0];
  } else {
    normalizedRedirect = undefined;
  }
  return normalizedRedirect ?? fallbackPath;
}

/**
 * Layout used for authentication pages that presents a left content panel (with an optional back link and badge) and a translated right-side hero image.
 *
 * Renders children inside the left panel; the right side displays translated headline, description, hero fields, and highlights.
 *
 * @param children - Content to render in the left panel of the layout
 * @param backHref - Optional URL for the back link; when omitted the back control is rendered without a destination
 * @param backLabel - Optional label for the back link; defaults to "Back to Home" when not provided
 * @returns A React element containing the authentication layout
 */
export default async function AuthFlowLayout({
  children,
  backHref,
  backLabel,
}: AuthFlowLayoutProps) {
  const t = await getTranslations("authentication.brand");
  const highlights = highlightKeys.map((key) => t(`values.${key}`));

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <BackgroundAnimations />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col gap-6 p-4 sm:px-6 sm:py-8 md:px-8">
        {/* Cards container with equal heights */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
          {/* Left card - Form content */}
          <div
            className={cn(
              "mx-auto w-full max-w-xl",
              "flex flex-col border border-border/40 bg-card/40 p-4 backdrop-blur-xl",
              "lg:mx-0 lg:w-1/2 lg:max-w-none",
              "lg:p-6",
            )}
          >
            <AnimatedGroup
              className="flex flex-col gap-2"
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                },
                item: {
                  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  },
                },
              }}
            >
              <div className="flex items-center justify-between">
                {/* Back to Home button positioned outside cards */}
                <div className="mx-auto w-full max-w-7xl">
                  <BackToHome
                    href={backHref}
                    label={backLabel ?? "Back to Home"}
                  />
                </div>
                <span className="rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-[0.4em] text-nowrap text-primary uppercase">
                  {t("badge")}
                </span>
              </div>

              <div className="space-y-4">{children}</div>
            </AnimatedGroup>
          </div>

          {/* Right card - Hero image with equal height */}
          <RightSideImage
            description={t("description")}
            headline={t("headline")}
            heroBadge={t("heroBadge")}
            heroCaption={t("heroCaption")}
            heroStatOne={t("heroStatOne")}
            heroStatTwo={t("heroStatTwo")}
            heroTitle={t("heroTitle")}
            highlights={highlights}
          />
        </div>
      </div>
    </div>
  );
}
