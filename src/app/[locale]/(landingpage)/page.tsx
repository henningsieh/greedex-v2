import { GlobeSection } from "@/components/features/landingpage/globe-section";
import { HeroSection } from "@/components/features/landingpage/hero-section";
import { WorkshopsHeroSection } from "@/components/features/landingpage/workshops/workshops-hero-section";

/**
 * Render the landing page composed of the main hero, globe, and workshops hero sections.
 *
 * @returns The JSX element for the landing page: a <main> wrapper containing `HeroSection`, `GlobeSection`, and `WorkshopsHeroSection`.
 */
export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <HeroSection />

      <GlobeSection />

      <WorkshopsHeroSection />
    </main>
  );
}