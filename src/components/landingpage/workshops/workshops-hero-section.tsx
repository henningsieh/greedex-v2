import { ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { calculatorWorkshops } from "@/components/landingpage/workshops/workshops.config";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WorkshopsHeroSection() {
  return (
    <section
      id="workshops"
      className="min-h-[calc(100vh-5rem)] py-24 md:py-32 dark:bg-transparent"
    >
      <div className="@container mx-auto max-w-6xl px-6 lg:px-0">
        <div className="space-y-8 text-center">
          <h2 className="text-balance font-semibold text-4xl lg:text-5xl">
            Hello, fellow{" "}
            <span className="bg-accent text-accent-foreground">
              Earth walker
            </span>
            .
          </h2>
          <p className="mx-auto max-w-4xl">
            We are very happy you have found a way to our Greendex page. This
            page will help you bring awareness of sustainable and eco-friendly
            habits on the Erasmus+ project.
          </p>
          <p className="mx-auto max-w-4xl">
            In this section we offer you three different{" "}
            <span className="bg-primary text-primary-foreground text-xl capitalize">
              workshops
            </span>{" "}
            for you to use on your learning mobility, depending on your time:
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
          {Object.values(calculatorWorkshops).map((w) => (
            <Link
              key={w.id}
              href={`/workshops?type=${w.id}`}
              className="group block h-full"
            >
              <Card className="group-hover:-translate-y-1 flex h-full flex-col overflow-hidden transition-transform duration-300 will-change-transform group-hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-44 w-full">
                    <Image
                      src={w.image}
                      alt={w.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <CardTitle className="space-y-3 p-6 text-center">
                    <h3 className="font-bold text-2xl">{w.title}</h3>
                    <p className="flex items-center justify-center gap-2 rounded-md bg-secondary/80 py-2 text-secondary-foreground">
                      <ClockIcon className="inline size-5" />
                      {w.duration}
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">{w.description}</CardContent>
                <CardFooter className="justify-end">
                  <span className="font-medium text-primary text-sm underline underline-offset-4">
                    Learn More →
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </AnimatedGroup>

        <div className="mx-auto mt-16 max-w-5xl space-y-8 text-center">
          <p>
            You can use the same workshop on every single mobility, because the
            numbers will always be different. These workshops will bring
            awareness about the sustainability of this mobility and will inspire
            you to take some actions. Sustainability is not just a topic, is a
            principle we should all live by.
          </p>

          <p>
            If you are interested to learn more about the sustainability, go to
            sections{" "}
            <Link className="text-primary underline" href="/#">
              Library
            </Link>{" "}
            and{" "}
            <Link className="text-primary underline" href="/tips-and-tricks">
              Tips and Tricks
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
