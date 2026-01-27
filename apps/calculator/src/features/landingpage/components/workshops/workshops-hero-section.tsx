import { ClockIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { AnimatedGroup } from "@/components/animated-group";
import { BackgroundAnimations } from "@/components/background-animations";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WORKSHOPS } from "@/config/workshops";
import { Link } from "@/lib/i18n/routing";

export async function WorkshopsHeroSection() {
  const t = await getTranslations("LandingPage");
  const intro2 = t("workshops.intro2");
  const intro2Parts = intro2.split("workshops");
  return (
    <section
      className="relative min-h-[calc(100vh-5rem)] overflow-hidden py-24 md:py-32"
      id="workshops"
    >
      <BackgroundAnimations />

      <div className="@container relative z-10 mx-auto max-w-6xl px-6 lg:px-0">
        <div className="space-y-8 text-center">
          <h2 className="text-3xl leading-12 font-semibold text-balance lg:text-5xl">
            {t("workshops.headingPrefix")}{" "}
            <span className="bg-linear-to-r from-primary/20 to-primary/60 text-primary-foreground">
              {t("workshops.headingEmphasis")}
            </span>
            .
          </h2>
          <p className="mx-auto max-w-4xl">{t("workshops.intro1")}</p>
          <p className="mx-auto max-w-4xl">
            {intro2Parts[0]}{" "}
            <span className="bg-linear-to-r from-primary/80 to-primary/40 px-2 py-1 text-xl text-primary-foreground capitalize">
              {t("workshops.keyword")}
            </span>{" "}
            {intro2Parts[1] ?? ""}
          </p>
        </div>

        <AnimatedGroup
          className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 md:mt-12 md:grid-cols-3"
          triggerOnView
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.08,
                },
              },
            },
            item: {
              hidden: {
                opacity: 0,
                y: 18,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  bounce: 0.22,
                  duration: 0.6,
                },
              },
            },
          }}
          viewport={{
            once: true,
            amount: 0.35,
          }}
        >
          {WORKSHOPS.map((workshop) => {
            const workshopId = workshop.id;
            const title = t(`workshops.types.${workshopId}.title`);
            const duration = t(`workshops.types.${workshopId}.duration`);
            const description = t(`workshops.types.${workshopId}.description`);

            return (
              <Link
                className="group block h-full"
                href={`/workshops?type=${workshop.id}`}
                key={workshop.id}
              >
                <Card className="flex h-full flex-col overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 will-change-transform group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  <CardHeader className="p-0">
                    <div className="relative h-44 w-full">
                      <Image
                        alt={title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={workshop.image}
                      />
                    </div>
                    <CardTitle className="space-y-3 p-6 text-center">
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="flex items-center justify-center gap-2 rounded-md bg-secondary/80 py-2 text-secondary-foreground">
                        <ClockIcon className="inline size-5" />
                        {duration}
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">{description}</CardContent>
                  <CardFooter className="justify-end">
                    <span className="text-sm font-bold text-secondary-foreground underline underline-offset-4">
                      {t("workshops.card.learnMore")}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </AnimatedGroup>

        <div className="mx-auto mt-16 max-w-6xl space-y-8 text-center">
          <p>{t("workshops.bottomP1")}</p>

          <p>
            {t("workshops.bottomP2Prefix")}{" "}
            <Link className="text-primary underline" href="/library">
              {t("workshops.library")}
            </Link>{" "}
            {t("workshops.bottomP2Middle") ?? "and"}{" "}
            <Link className="text-primary underline" href="/tips-and-tricks">
              {t("workshops.tipsAndTricks")}
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
