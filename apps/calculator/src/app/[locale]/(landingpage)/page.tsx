import { GlobeSection } from "@/features/landingpage/components/globe-section";
import { HeroSection } from "@/features/landingpage/components/hero-section";
import { WorkshopsHeroSection } from "@/features/landingpage/components/workshops/workshops-hero-section";

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
