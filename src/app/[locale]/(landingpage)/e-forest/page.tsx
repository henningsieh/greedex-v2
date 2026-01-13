import { DonateSection } from "@/components/features/landingpage/e+forest/donate-section";
import { DreamSection } from "@/components/features/landingpage/e+forest/dream-section";
import { HeroSection } from "@/components/features/landingpage/e+forest/hero-section";

export default function EplusForestPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <DreamSection />
      <DonateSection />
    </main>
  );
}
