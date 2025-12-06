import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { BackToHome } from "@/components/back-to-home";
import { RightSideImage } from "@/components/features/authentication/right-side-image";
import { cn } from "@/lib/utils";

const highlightKeys = ["one", "two", "three"] as const;

type AuthFlowLayoutProps = {
  children: ReactNode;
  backLabel?: string;
  backHref?: string;
};

export function normalizeRedirectPath(
  nextPageUrl: string | string[] | undefined,
  fallbackPath: string,
): string {
  const normalizedRedirect =
    typeof nextPageUrl === "string"
      ? nextPageUrl
      : Array.isArray(nextPageUrl)
        ? nextPageUrl[0]
        : undefined;
  return normalizedRedirect ?? fallbackPath;
}

export default async function AuthFlowLayout({
  children,
  backHref,
  backLabel,
}: AuthFlowLayoutProps) {
  const t = await getTranslations("authentication.brand");
  const highlights = highlightKeys.map((key) => t(`values.${key}`));

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20">
        <div className="-left-20 -top-32 absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,_var(--primary)_0%,_transparent_70%)] opacity-35 blur-[120px]" />
        <div className="-right-10 absolute top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,_var(--primary)_0%,_transparent_80%)] opacity-40 blur-[100px]" />
        <div className="-bottom-10 -translate-x-1/2 absolute left-1/2 h-72 w-72 rounded-full bg-[radial-gradient(circle,_var(--accent)_0%,_transparent_80%)] opacity-25 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 sm:py-10 md:px-8 lg:flex-row lg:items-stretch lg:gap-14">
        <div
          className={cn(
            "mx-auto w-full max-w-xl",
            // "rounded-[32px] border border-border bg-card p-6 shadow-xl",
            "backdrop-blur-sm xl:mx-0 xl:w-1/2 xl:max-w-none",
            // "sm:p-6 xl:p-10",
          )}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BackToHome label={backLabel ?? "Back to Home"} href={backHref} />
              <span className="rounded-full border border-primary/50 bg-primary/10 px-4 py-1 font-semibold text-primary text-xs uppercase tracking-[0.4em]">
                {t("badge")}
              </span>
            </div>

            <div className="space-y-8">{children}</div>
          </div>
        </div>

        <RightSideImage
          headline={t("headline")}
          description={t("description")}
          highlights={highlights}
          heroBadge={t("heroBadge")}
          heroTitle={t("heroTitle")}
          heroCaption={t("heroCaption")}
          heroStatOne={t("heroStatOne")}
          heroStatTwo={t("heroStatTwo")}
        />
      </div>
    </div>
  );
}
