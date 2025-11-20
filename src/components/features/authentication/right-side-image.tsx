import Image from "next/image";
import { cn } from "@/lib/utils";

type RightSideImageProps = {
  headline: string;
  description: string;
  highlights: string[];
  heroBadge: string;
  heroTitle: string;
  heroCaption: string;
  heroStatOne: string;
  heroStatTwo: string;
};

export default function RightSideImage({
  headline,
  description,
  highlights,
  heroBadge,
  heroTitle,
  heroCaption,
  heroStatOne,
  heroStatTwo,
}: RightSideImageProps) {
  return (
    <div className="relative hidden xl:flex xl:w-1/2">
      <div className="relative flex-1 py-14">
        <div
          className={cn(
            "relative flex h-full flex-col gap-8 overflow-hidden lg:p-10",
            // "rounded border border-border bg-card p-6 shadow-xl backdrop-blur",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary)_0%,_transparent_70%)] opacity-20" />

          {/* Brand headline and description */}
          <div className="relative z-10 flex flex-col gap-5">
            <h1 className="font-semibold text-3xl text-foreground leading-tight lg:text-4xl">
              {headline}
            </h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>

          {/* Highlights list */}
          <ul className="relative z-10 grid gap-3 text-sm">
            {highlights.map((value, index) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: <come on>
                key={`${value}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-2 font-medium text-sm"
              >
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span className="text-foreground">{value}</span>
              </li>
            ))}
          </ul>

          {/* Hero section */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 font-semibold text-primary text-xs uppercase tracking-[0.4em]">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{heroBadge}</span>
            </div>
            <h3 className="font-semibold text-2xl text-foreground">
              {heroTitle}
            </h3>
            <p className="text-muted-foreground text-sm">{heroCaption}</p>
          </div>

          {/* Hero image */}
          <div className="relative z-10 h-48 w-full overflow-hidden rounded-3xl border border-border bg-muted/50">
            <Image
              src="/Greendex-hero-banner.png"
              alt="Greendex dashboards"
              fill
              sizes="(max-width: 1024px) 100vw, 540px"
              className="object-cover"
            />
          </div>

          {/* Stats */}
          <div className="relative z-10 grid gap-3 text-[0.65rem] uppercase tracking-[0.4em] sm:grid-cols-2">
            <span className="rounded-2xl border border-primary/50 bg-primary/10 px-3 py-2 text-primary">
              {heroStatOne}
            </span>
            <span className="rounded-2xl border border-border bg-muted/50 px-3 py-2 text-muted-foreground">
              {heroStatTwo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
