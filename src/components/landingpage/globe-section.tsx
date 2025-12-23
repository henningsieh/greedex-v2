"use client";

import { AnimatedGroup } from "@/components/animated-group";
import { Globe } from "@/components/ui/globe";
import { EU_CAPITAL_CITIES } from "@/config/eu-cities";
import { EU_MEMBER_COUNT, type EUCountryCode } from "@/config/eu-countries";

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

/**
 * Globe section component for the landing page
 * Displays an interactive 3D globe showcasing EU member states
 */
export function GlobeSection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left side - Text content */}
            <div className="space-y-6">
              <div className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-semibold text-primary text-sm uppercase tracking-wider">
                Global Impact
              </div>

              <h2 className="font-semibold text-4xl tracking-tight md:text-5xl lg:text-6xl">
                Across Europe,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                  Together
                </span>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
                Greendex connects organizations across all {EU_MEMBER_COUNT} EU
                member states, creating a unified network dedicated to
                environmental sustainability and green initiatives.
              </p>

              <div className="grid gap-6 pt-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="font-bold text-4xl text-primary">
                    {EU_MEMBER_COUNT}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    EU Member States
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-4xl text-primary">450M+</div>
                  <p className="text-muted-foreground text-sm">
                    Potential Participants
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                {(
                  [
                    "AT", // Austria
                    "BE", // Belgium
                    "DE", // Germany
                    "FR", // France
                    "IT", // Italy
                    "ES", // Spain
                    "PL", // Poland
                    "NL", // Netherlands
                  ] satisfies EUCountryCode[]
                ).map((countryCode) => {
                  const city = EU_CAPITAL_CITIES.find(
                    (c) => c.countryCode === countryCode,
                  );
                  if (!city) return null;
                  return (
                    <span
                      key={countryCode}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs"
                    >
                      {city.name}
                    </span>
                  );
                })}
                <span className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 font-semibold text-primary text-xs">
                  +{EU_MEMBER_COUNT - 8} more
                </span>
              </div>
            </div>

            {/* Right side - Globe */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                {/* Glow effect behind globe */}
                <div className="-z-10 absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-500/20 to-cyan-400/20 blur-3xl dark:from-emerald-500/30 dark:via-teal-600/30 dark:to-cyan-500/30" />

                {/* Globe component (CSS glow removed to avoid double halo) */}
                <Globe
                  className="mx-auto"
                  cities={EU_CAPITAL_CITIES}
                  width={800}
                  height={800}
                  phi={4.5}
                  theta={0.6}
                  mapSamples={44000}
                  mapBrightness={3}
                  autoRotate={false}
                  // autoRotateSpeed={0.03}
                  markerColor={[0.15, 0.65, 0.4]}
                />
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
