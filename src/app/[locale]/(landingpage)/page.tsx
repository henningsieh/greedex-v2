import { GlobeSection } from "@/components/landingpage/globe-section";
import { HeroSection } from "@/components/landingpage/hero-section";
import { WorkshopsHeroSection } from "@/components/landingpage/workshops/workshops-hero-section";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />

      <GlobeSection />

      <WorkshopsHeroSection />
    </main>
  );
}
