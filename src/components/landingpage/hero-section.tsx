import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AnimatedGradientCTA } from "@/components/animated-cta";
import { AnimatedGroup } from "@/components/animated-group";
import { TextEffect } from "@/components/ui/text-effect";
import { DASHBOARD_PATH } from "@/config/AppRoutes";
import { Link } from "@/lib/i18n/routing";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as const;

const BrushStroke = () => (
  <div
    aria-hidden
    className="mx-auto mt-4 h-2 w-28 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-600 to-transparent opacity-75"
  />
);

export async function HeroSection() {
  const t = await getTranslations("LandingPage");
  return (
    <>
      {/* subtle background image behind everything (low opacity, non-interactive) */}
      <div aria-hidden className="-z-30 pointer-events-none absolute inset-0">
        <Image
          src="/herobg.jpg"
          alt="hero background"
          fill
          className="object-cover opacity-50 dark:opacity-15"
          priority
        />
      </div>

      <section>
        <div className="relative pt-20">
          <div
            aria-hidden
            className="-z-10 absolute inset-0 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.2,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div
              id="herobanner"
              className="mask-b-from-55% relative mb-16 overflow-hidden px-2 sm:mr-0"
            >
              {/* CTA placed at the top, centered above the hero image */}
              <div className="relative z-20 mx-auto mb-6 flex max-w-7xl justify-center px-4">
                <Link
                  href={DASHBOARD_PATH}
                  title={t("launchButtonAria")}
                  aria-label={t("launchButtonAria")}
                  className="inline-block"
                >
                  <AnimatedGradientCTA leftEmoji={"🌳"}>
                    {t("launchButton")}
                  </AnimatedGradientCTA>
                </Link>
              </div>

              <div className="relative inset-shadow-2xs mx-auto aspect-video max-w-6xl overflow-hidden rounded-3xl border border-border/40 bg-card/30 p-4 shadow-2xl shadow-primary/10 ring-1 ring-background backdrop-blur-xl dark:inset-shadow-white/20">
                <Image
                  className="relative hidden aspect-15/8 rounded-2xl bg-background object-cover dark:block"
                  src="/Greendex-hero-banner.png"
                  alt="app screen"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
                />
                <Image
                  className="relative aspect-15/8 rounded-2xl bg-background object-cover dark:hidden"
                  src="/Greendex-hero-banner.png"
                  alt="app screen"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
                />
              </div>
            </div>
          </AnimatedGroup>

          <div className="mx-auto mt-16 mb-32 hidden items-center justify-center md:flex">
            <a
              href="#hero-text"
              aria-label={t("hero.scrollDown")}
              className="group inline-block"
            >
              <div
                className="animate-bounce animate-gradient-shift rounded-full p-3 shadow-emerald-500/50 shadow-lg ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-background transition-all group-hover:scale-110 group-hover:shadow-cyan-500/70 group-hover:shadow-xl group-hover:ring-cyan-400/50"
                style={
                  {
                    background:
                      "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #10b981 100%)",
                    backgroundSize: "200% 200%",
                  } as React.CSSProperties
                }
              >
                <ChevronDown className="size-7 shrink-0 stroke-[3] text-white drop-shadow-lg transition-transform group-hover:translate-y-0.5" />
              </div>
            </a>
          </div>

          <div
            id="hero-text"
            className="mx-auto max-w-7xl scroll-mt-32 px-6 pb-40"
          >
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-8 text-balance font-semibold text-5xl tracking-tight max-md:font-semibold md:text-6xl lg:mt-14 xl:text-7xl"
                >
                  {t("hero.missionTitle")}
                </TextEffect>

                <BrushStroke />

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.5}
                  delay={0.2}
                  as="p"
                  className="mx-auto mt-6 max-w-7xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                >
                  {t("hero.missionText")}
                </TextEffect>

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="h2"
                  className="mx-auto mt-8 text-balance font-semibold text-4xl tracking-tight max-md:font-semibold md:text-5xl lg:mt-14 xl:text-6xl"
                >
                  {t("hero.visionTitle")}
                </TextEffect>

                <BrushStroke />

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.5}
                  delay={0.7}
                  as="p"
                  className="mx-auto mt-6 max-w-7xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                >
                  {t("hero.visionText")}
                </TextEffect>
              </AnimatedGroup>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-background pt-16 pb-16 md:pb-32">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
            <Link
              href={DASHBOARD_PATH}
              title={t("hero.meetCustomers")}
              aria-label={t("hero.meetCustomers")}
              className="block text-sm duration-150 hover:opacity-75"
            >
              <span>{t("hero.meetCustomers")}</span>

              <ChevronRight className="ml-1 inline-block size-3" />
            </Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
            {/** Ensure external SVGs maintain aspect ratio when CSS changes one dimension. We set height via classes and keep width auto inline. */}
            <div className="flex">
              <Image
                className="mx-auto h-5 dark:invert"
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                width={64}
                height={20}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>

            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                width={64}
                height={16}
                style={{
                  width: 64,
                  height: 16,
                }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                width={64}
                height={16}
                style={{
                  width: 64,
                  height: 16,
                }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-5 dark:invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                width={64}
                height={20}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-5 dark:invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                width={64}
                height={20}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                width={64}
                height={16}
                style={{
                  width: 64,
                  height: 16,
                }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-7 dark:invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                width={64}
                height={28}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>

            <div className="flex">
              <Image
                className="mx-auto h-6 dark:invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                width={64}
                height={24}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
