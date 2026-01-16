import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  isScrolled?: boolean;
}

export function Logo({ isScrolled = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden={!isScrolled}
        className={cn(
          "relative h-10 overflow-hidden transition-all duration-600 ease-in-out",
          isScrolled ? "w-18" : "w-0",
          "hidden sm:inline-block lg:hidden xl:inline-block",
        )}
      >
        <Image
          alt="Logo"
          className={`object-contain transition-opacity duration-200 ease-in-out ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
          fill
          sizes="(max-width: 640px) 120px, 180px"
          src="/greendex_logo.png"
        />
      </div>

      <p className="text-2xl font-bold whitespace-nowrap text-primary transition-all duration-600 ease-in-out sm:text-2xl md:text-3xl">
        GREEN<span className="text-muted-foreground">DEX</span>
      </p>
    </div>
  );
}
