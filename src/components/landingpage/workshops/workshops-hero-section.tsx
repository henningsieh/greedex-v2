import { ClockIcon } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  type CalculatorType,
  WORKSHOPS,
} from "@/components/landingpage/workshops/workshops.config";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";

export default async function WorkshopsHeroSection() {
  const t = await getTranslations("LandingPage");
  const intro2 = t("workshops.intro2");
  const intro2Parts = intro2.split("workshops");
  return (
    <section
      id="workshops"
      className="min-h-[calc(100vh-5rem)] bg-background/60 py-24 md:py-32"
    >
      <div className="@container mx-auto max-w-6xl px-6 lg:px-0">
        <div className="space-y-8 text-center">
          <h2 className="text-balance font-semibold text-4xl lg:text-5xl">
            {t("workshops.headingPrefix")}{" "}
            <span className="bg-gradient-to-r from-primary/20 to-primary/60 px-1 py-2 text-primary-foreground">
              {t("workshops.headingEmphasis")}
            </span>
            .
          </h2>
          <p className="mx-auto max-w-4xl">{t("workshops.intro1")}</p>
          <p className="mx-auto max-w-4xl">
            {intro2Parts[0]}{" "}
            <span className="bg-gradient-to-r from-primary/80 to-primary/40 px-2 py-1 text-primary-foreground text-xl capitalize">
              {t("workshops.keyword")}
            </span>{" "}
            {intro2Parts[1] ?? ""}
          </p>
        </div>

        <AnimatedGroup
          triggerOnView
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            container: {
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.08 },
              },
            },
            item: {
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", bounce: 0.22, duration: 0.6 },
              },
            },
          }}
          className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 md:mt-12 md:grid-cols-3"
        >
          {(Object.keys(WORKSHOPS) as CalculatorType[]).map((workshopId) => {
            const workshop = WORKSHOPS[workshopId];
            const title = t(`workshops.types.${workshopId}.title`);
            const duration = t(`workshops.types.${workshopId}.duration`);
            const description = t(`workshops.types.${workshopId}.description`);

            return (
              <Link
                key={workshop.id}
                href={`/workshops?type=${workshop.id}`}
                className="group block h-full"
              >
                <Card className="group-hover:-translate-y-1 flex h-full flex-col overflow-hidden transition-transform duration-300 will-change-transform group-hover:shadow-lg">
                  <CardHeader className="p-0">
                    <div className="relative h-44 w-full">
                      <Image
                        src={workshop.image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <CardTitle className="space-y-3 p-6 text-center">
                      <h3 className="font-bold text-2xl">{title}</h3>
                      <p className="flex items-center justify-center gap-2 rounded-md bg-secondary/80 py-2 text-secondary-foreground">
                        <ClockIcon className="inline size-5" />
                        {duration}
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">{description}</CardContent>
                  <CardFooter className="justify-end">
                    <span className="font-bold text-secondary-foreground text-sm underline underline-offset-4">
                      {t("workshops.card.learnMore")}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </AnimatedGroup>

        <div className="mx-auto mt-16 max-w-5xl space-y-8 text-center">
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
