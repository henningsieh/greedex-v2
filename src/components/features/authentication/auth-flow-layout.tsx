import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import BackToHome from "@/components/back-to-home";
import RightSideImage from "./right-side-image";

const highlightKeys = ["one", "two", "three"] as const;

type AuthFlowLayoutProps = {
  children: ReactNode;
  backLabel?: string;
  backHref?: string;
};

export default async function AuthFlowLayout({
  children,
  backHref,
  backLabel,
}: AuthFlowLayoutProps) {
  const t = await getTranslations("authentication.brand");
  const highlights = highlightKeys.map((key) => t(`values.${key}`));

  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="-left-20 -top-32 absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.35),_transparent_70%)] blur-[120px]" />
        <div className="-right-10 absolute top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.4),_transparent_80%)] blur-[100px]" />
        <div className="-bottom-10 -translate-x-1/2 absolute left-1/2 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.25),_transparent_80%)] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 md:px-8 lg:flex-row lg:items-start lg:gap-14">
        <div className="w-full rounded-[32px] border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/40 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.8)] backdrop-blur-md lg:p-10">
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BackToHome label={backLabel ?? "Back to Home"} href={backHref} />
              <span className="rounded-full border border-emerald-400/50 bg-white/5 px-4 py-1 font-semibold text-emerald-200 text-xs uppercase tracking-[0.4em] shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                {t("badge")}
              </span>
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="font-semibold text-3xl text-white leading-tight md:text-4xl lg:text-5xl">
                {t("headline")}
              </h1>
              <p className="max-w-3xl text-base text-white/80">
                {t("description")}
              </p>
            </div>

            <ul className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              {highlights.map((value, index) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: <come on>
                  key={`${value}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-sm shadow-[0_4px_25px_rgba(2,6,23,0.6)]"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-8">{children}</div>
          </div>
        </div>

        <RightSideImage
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
