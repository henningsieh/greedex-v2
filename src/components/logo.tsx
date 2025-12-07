import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  isScrolled?: boolean;
}

export function Logo({ isScrolled = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative h-10 overflow-hidden transition-all duration-600 ease-in-out",
          isScrolled ? "w-18" : "w-0",
          "hidden sm:inline-block lg:hidden xl:inline-block",
        )}
        aria-hidden={!isScrolled}
      >
        <Image
          src="/greendex_logo.png"
          alt="Logo"
          fill
          sizes="(max-width: 640px) 120px, 180px"
          className={`object-contain transition-opacity duration-200 ease-in-out ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p className="whitespace-nowrap font-bold text-2xl text-primary transition-all duration-600 ease-in-out sm:text-2xl md:text-3xl">
        GREEN<span className="text-muted-foreground">DEX</span>
      </p>
    </div>
  );
}
