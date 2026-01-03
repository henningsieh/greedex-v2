import { GlobeSection } from "@/components/features/landingpage/globe-section";
import { HeroSection } from "@/components/features/landingpage/hero-section";
import { WorkshopsHeroSection } from "@/components/features/landingpage/workshops/workshops-hero-section";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />

      <GlobeSection />

      <WorkshopsHeroSection />
    </main>
  );
}
