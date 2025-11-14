import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import WorkshopsHeroSection from "@/components/landingpage/workshops/workshops-hero-section";

export default function LandingPage() {
  return (
    <>
      <HeroHeader />
      <main className="relative overflow-hidden">
        <HeroSection />
        <WorkshopsHeroSection />
      </main>
    </>
  );
}
