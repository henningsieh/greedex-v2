import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AnimatedGradientCTA } from "@/components/animated-cta";
import { AnimatedGroup } from "@/components/animated-group";
import { TextEffect } from "@/components/ui/text-effect";
import { DASHBOARD_PATH } from "@/config/app-routes";
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
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
        <Image
          alt="hero background"
          className="object-cover opacity-50 dark:opacity-15"
          fill
          priority
          src="/herobg.jpg"
        />
      </div>

      <section className="relative flex flex-col md:min-h-svh">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
        />
        <div className="relative flex flex-1 flex-col justify-between gap-8 pt-24 pb-8 md:pb-12">
          {/* CTA placed at the top */}
          <div className="relative mx-auto flex max-w-7xl shrink-0 justify-center px-4">
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

          {/* Hero Image */}
          <AnimatedGroup
            // className="flex min-h-0 flex-1 flex-col [&>div]:flex [&>div]:min-h-0 [&>div]:flex-1 [&>div]:flex-col"
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
            {/* Hero Image Container */}
            <div
              className="mask-b-from-55% relative flex h-full w-full items-center justify-center overflow-hidden px-2 sm:mr-0"
              id="herobanner"
            >
              <div className="relative inset-shadow-2xs mx-auto aspect-video max-h-full w-full max-w-6xl overflow-hidden rounded-3xl border border-border/40 bg-card/30 object-contain p-4 shadow-2xl shadow-primary/10 ring-1 ring-background backdrop-blur-xl dark:inset-shadow-white/20">
                <Image
                  alt="app screen"
                  className="relative hidden aspect-15/8 rounded-2xl bg-background object-cover dark:block"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
                  src="/Greendex-hero-banner.png"
                />
                <Image
                  alt="app screen"
                  className="relative aspect-15/8 rounded-2xl bg-background object-cover dark:hidden"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
                  src="/Greendex-hero-banner.png"
                />
              </div>
            </div>
          </AnimatedGroup>

          {/* Scroll down trigger */}
          <div className="mx-auto hidden shrink-0 animate-bounce items-center justify-center md:flex">
            <a
              aria-label={t("hero.scrollDown")}
              className="group inline-block"
              href="#hero-text"
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
        </div>
      </section>

      <section>
        <div
          className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20"
          id="hero-text"
        >
          <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
            <AnimatedGroup variants={transitionVariants}>
              <TextEffect
                as="h1"
                className="mx-auto mt-8 text-balance font-semibold text-5xl tracking-tight max-md:font-semibold md:text-6xl lg:mt-14 xl:text-7xl"
                preset="fade-in-blur"
                speedSegment={0.3}
              >
                {t("hero.missionTitle")}
              </TextEffect>

              <BrushStroke />

              <TextEffect
                as="p"
                className="mx-auto mt-6 max-w-7xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                delay={0.2}
                per="line"
                preset="fade-in-blur"
                speedSegment={0.5}
              >
                {t("hero.missionText")}
              </TextEffect>

              <TextEffect
                as="h2"
                className="mx-auto mt-8 text-balance font-semibold text-4xl tracking-tight max-md:font-semibold md:text-5xl lg:mt-14 xl:text-6xl"
                delay={0.5}
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
              >
                {t("hero.visionTitle")}
              </TextEffect>

              <BrushStroke />

              <TextEffect
                as="p"
                className="mx-auto mt-6 max-w-7xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                delay={0.7}
                per="line"
                preset="fade-in-blur"
                speedSegment={0.5}
              >
                {t("hero.visionText")}
              </TextEffect>
            </AnimatedGroup>
          </div>
        </div>
      </section>
      <section className="bg-background pt-16 pb-16 md:pb-32">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
            <Link
              aria-label={t("hero.meetCustomers")}
              className="block text-sm duration-150 hover:opacity-75"
              href={DASHBOARD_PATH}
              title={t("hero.meetCustomers")}
            >
              <span>{t("hero.meetCustomers")}</span>

              <ChevronRight className="ml-1 inline-block size-3" />
            </Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14">
            {/** Ensure external SVGs maintain aspect ratio when CSS changes one dimension. We set height via classes and keep width auto inline. */}
            <div className="flex">
              <Image
                alt="Nvidia Logo"
                className="mx-auto h-5 dark:invert"
                height={20}
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                style={{
                  width: "auto",
                  height: "auto",
                }}
                width={64}
              />
            </div>

            <div className="flex">
              <Image
                alt="Column Logo"
                className="mx-auto dark:invert"
                height={16}
                src="https://html.tailus.io/blocks/customers/column.svg"
                style={{
                  width: 64,
                  height: 16,
                }}
                width={64}
              />
            </div>
            <div className="flex">
              <Image
                alt="GitHub Logo"
                className="mx-auto dark:invert"
                height={16}
                src="https://html.tailus.io/blocks/customers/github.svg"
                style={{
                  width: 64,
                  height: 16,
                }}
                width={64}
              />
            </div>
            <div className="flex">
              <Image
                alt="Nike Logo"
                className="mx-auto h-5 dark:invert"
                height={20}
                src="https://html.tailus.io/blocks/customers/nike.svg"
                style={{
                  width: "auto",
                  height: "auto",
                }}
                width={64}
              />
            </div>
            <div className="flex">
              <Image
                alt="Lemon Squeezy Logo"
                className="mx-auto h-5 dark:invert"
                height={20}
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                style={{
                  width: "auto",
                  height: "auto",
                }}
                width={64}
              />
            </div>
            <div className="flex">
              <Image
                alt="Laravel Logo"
                className="mx-auto dark:invert"
                height={16}
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                style={{
                  width: 64,
                  height: 16,
                }}
                width={64}
              />
            </div>
            <div className="flex">
              <Image
                alt="Lilly Logo"
                className="mx-auto h-7 dark:invert"
                height={28}
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                style={{
                  width: "auto",
                  height: "auto",
                }}
                width={64}
              />
            </div>

            <div className="flex">
              <Image
                alt="OpenAI Logo"
                className="mx-auto h-6 dark:invert"
                height={24}
                src="https://html.tailus.io/blocks/customers/openai.svg"
                style={{
                  width: "auto",
                  height: "auto",
                }}
                width={64}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
