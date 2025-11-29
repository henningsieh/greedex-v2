import Image from "next/image";
import {
  PARTNERS,
  PARTNERS_HEADLINE,
} from "@/components/landingpage/about/about.configuration";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen py-28">
      <div className="container mx-auto max-w-6xl space-y-12 px-6">
        <header className="space-y-5 text-center">
          <h1 className="font-semibold text-5xl">About Greendex</h1>
          <p className="mx-auto max-w-5xl text-lg text-muted-foreground">
            {PARTNERS_HEADLINE}
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {PARTNERS.map((p) => (
            <Card key={p.id} className="relative flex flex-col border-accent">
              {/* Shadcn Partner Badge with secondary color */}
              <Badge
                variant="secondary"
                className="absolute top-4 right-4 border border-secondary bg-secondary/25 pt-1 font-bold text-secondary text-sm"
              >
                Partner
              </Badge>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-sm border border-border">
                  <Image
                    src={p.logo}
                    alt={`${p.name} logo`}
                    fill
                    sizes="240px"
                    style={{
                      objectFit: "contain",
                    }}
                    priority={false}
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
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary text-sm underline-offset-2 hover:underline"
                  >
                    Visit website
                  </a>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </section>

        <footer className="text-center text-muted-foreground text-sm">
          <p>Co-funded by the Erasmus+ programme.</p>
        </footer>
      </div>
    </main>
  );
}
