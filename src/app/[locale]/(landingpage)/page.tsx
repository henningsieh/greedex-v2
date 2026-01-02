import { GlobeSection } from "@/components/landingpage/components/globe-section";
import { HeroSection } from "@/components/landingpage/components/hero-section";
import { WorkshopsHeroSection } from "@/components/landingpage/components/workshops/workshops-hero-section";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />

      <GlobeSection />

      <WorkshopsHeroSection />
    </main>
  );
}
