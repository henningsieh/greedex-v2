import { DonateSection } from "@/features/landingpage/components/e+forest/donate-section";
import { DreamSection } from "@/features/landingpage/components/e+forest/dream-section";
import { HeroSection } from "@/features/landingpage/components/e+forest/hero-section";

export default function EplusForestPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <DreamSection />
      <DonateSection />
    </main>
  );
}
