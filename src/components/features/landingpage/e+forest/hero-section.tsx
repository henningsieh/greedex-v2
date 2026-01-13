import Image from "next/image";
import { useTranslations } from "next-intl";
import { eForestConfig } from "@/config/e-forest";

export function HeroSection() {
  const t = useTranslations("EPlusForest.hero");

  return (
    <div className="relative h-[50vh] min-h-125 w-full overflow-hidden">
      <Image
        alt={t("title")}
        className="object-cover"
        fill
        priority
        src={eForestConfig.heroImage}
        style={{ objectPosition: "bottom" }}
      />
      <div className="absolute inset-0 bg-background/60" />
      <div className="container relative z-10 mx-auto flex h-full items-center justify-center">
        <h1 className="text-center font-bold text-5xl text-foreground lg:text-7xl">
          {t("title")}
        </h1>
      </div>
    </div>
  );
}
