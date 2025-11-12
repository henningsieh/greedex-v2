import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { TextEffect } from "@/components/ui/text-effect";

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

export default function HeroSection() {
  return (
    <main className="relative overflow-hidden">
      {/* subtle background image behind everything (low opacity, non-interactive) */}
      <div aria-hidden className="-z-30 pointer-events-none absolute inset-0">
        <Image
          src="/herobg.jpg"
          alt="hero background"
          fill
          className="object-cover opacity-70 dark:opacity-20"
          priority
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>
      <section>
        <div className="relative pt-20 md:pt-32">
          <div
            aria-hidden
            className="-z-10 absolute inset-0 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <Link
                  href="/org/dashboard"
                  title="Open Erasmus+ Carbon Calculator — login required"
                  aria-label="Open Erasmus+ Carbon Calculator — login required"
                  className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-accent p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-primary/50 dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"
                >
                  <span className="flex h-8 items-center font-bold text-foreground text-lg">
                    Launch Erasmus+ Carbon Calculator
                  </span>
                  <span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700"></span>

                  <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
                    <div className="-translate-x-1/2 flex w-12 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-8 text-balance font-bold font-sans text-4xl tracking-tight max-md:font-semibold md:text-5xl lg:mt-14 xl:text-6xl"
                >
                  Our mission
                </TextEffect>

                <BrushStroke />

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.5}
                  delay={0.2}
                  as="h2"
                  className="mx-auto mt-6 max-w-6xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                >
                  Erasmus+ programme enables us to have amazing learning
                  adventures with inspirational people from different countries.
                  However, each of our personal gatherings contributes to a deep
                  carbon footprint due to our travelling and living habits. The
                  purpose of this project was to offset our carbon footprint on
                  the projects we make by bringing more awareness and more
                  action to change our habits. For this reason, we have created
                  a carbon footprint calculator that is specialized for Erasmus
                  + projects such as youth exchanges, training courses, meetings
                  etc. This calculator offers the final number of the CO2
                  produced by each participant and transforms this number to the
                  number of the average trees that will absorb our CO2 in their
                  lifetime. Our calculations are based on scientific research
                  done by different professionals. We did not make our own
                  calculations.
                </TextEffect>

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="h2"
                  className="mx-auto mt-8 text-balance font-extrabold text-3xl tracking-tight max-md:font-semibold md:text-4xl lg:mt-14 xl:text-5xl"
                >
                  Our vision
                </TextEffect>

                <BrushStroke />

                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.5}
                  delay={0.7}
                  as="h2"
                  className="mx-auto mt-6 max-w-6xl text-balance text-base text-foreground/90 leading-relaxed md:text-lg"
                >
                  We want to create a movement, where each Erasmus + project
                  calculates their carbon footprint and plants trees to offset
                  it. We see several Erasmus + forests rising in Europe which
                  contribute to the cleaner air in Europe. We see young people
                  continuing to learn together in a more sustainable
                  environment, while travelling green, and enjoying the beauty
                  of nature. \n This website has so much knowledge gathered for
                  you, so take some time and search a bit around.
                </TextEffect>
              </AnimatedGroup>

              <Link
                href="#workshops"
                aria-label="Scroll down"
                className="mx-auto"
              >
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.15,
                        },
                      },
                    },
                    item: {
                      hidden: { opacity: 0, y: 0 },
                      visible: {
                        opacity: 1,
                        y: 8,
                        transition: {
                          y: {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 1.1,
                            ease: "easeInOut",
                          },
                          opacity: { duration: 0.9 },
                        },
                      },
                    },
                  }}
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {/* three subtle dots indicating downward scroll */}
                  <div
                    key={0}
                    className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-foreground/20"
                  >
                    <span className="block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                  </div>
                  <div
                    key={1}
                    className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-foreground/10"
                  >
                    <span className="block h-1.5 w-1.5 rounded-full bg-foreground/50" />
                  </div>
                  <div
                    key={2}
                    className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-foreground/5"
                  >
                    <span className="block h-1.5 w-1.5 rounded-full bg-foreground/40" />
                  </div>
                </AnimatedGroup>
              </Link>
            </div>
          </div>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="mask-b-from-55% -mr-56 relative mt-8 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
              <div className="relative inset-shadow-2xs mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20">
                <Image
                  className="relative hidden aspect-15/8 rounded-2xl bg-background dark:block"
                  src="/mail2.png"
                  alt="app screen"
                  width="2700"
                  height="1440"
                />
                <Image
                  className="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden"
                  src="/mail2-light.png"
                  alt="app screen"
                  width="2700"
                  height="1440"
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>
      <section className="bg-background pt-16 pb-16 md:pb-32">
        <div className="group relative m-auto max-w-5xl px-6">
          <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
            <Link
              href="/"
              className="block text-sm duration-150 hover:opacity-75"
            >
              <span> Meet Our Customers</span>

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
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                width={64}
                height={16}
                style={{ width: 64, height: 16 }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                width={64}
                height={16}
                style={{ width: 64, height: 16 }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-5 dark:invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                width={64}
                height={20}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-5 dark:invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                width={64}
                height={20}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto dark:invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                width={64}
                height={16}
                style={{ width: 64, height: 16 }}
              />
            </div>
            <div className="flex">
              <Image
                className="mx-auto h-7 dark:invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                width={64}
                height={28}
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="flex">
              <Image
                className="mx-auto h-6 dark:invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                width={64}
                height={24}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
