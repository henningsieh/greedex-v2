import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PARTNERS } from "@/config/about";

/**
 * Renders the About page with localized content and a list of partner cards.
 *
 * This server-rendered React component loads translations for the "about" namespace
 * and displays an introduction, a responsive grid of partner cards (logo, name,
 * optional country, description, and optional external website link), and a footer
 * note about Erasmus funding.
 *
 * @returns The About page JSX element
 */
export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <main className="relative min-h-screen py-28">
      <div className="container relative z-10 mx-auto max-w-6xl space-y-12 px-6">
        <header className="space-y-5 text-center">
          <h1 className="font-semibold text-5xl">About Greendex</h1>
          <p className="mx-auto max-w-5xl text-lg text-muted-foreground">
            {t("partnersHeadline")}
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {PARTNERS.map((p) => (
            <Card className="relative flex flex-col border-accent" key={p.id}>
              {/* Shadcn Partner Badge with secondary color */}
              <Badge
                className="absolute top-4 right-4 border border-secondary bg-secondary/25 pt-1 font-bold text-secondary text-sm"
                variant="secondary"
              >
                {t("partnerBadge")}
              </Badge>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-sm border border-border">
                  <Image
                    alt={`${p.name} logo`}
                    fill
                    priority={false}
                    sizes="240px"
                    src={p.logo}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  {p.country ? (
                    <CardDescription>{p.country}</CardDescription>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text text-muted-foreground">{p.description}</p>
              </CardContent>

              <CardFooter className="mt-auto flex items-center gap-4">
                {p.website ? (
                  <a
                    className="font-medium text-primary text-sm underline-offset-2 hover:underline"
                    href={p.website}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("visitWebsite")}
                  </a>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </section>

        <footer className="text-center text-muted-foreground text-sm">
          <p>{t("erasmusFunding")}</p>
        </footer>
      </div>
    </main>
  );
}