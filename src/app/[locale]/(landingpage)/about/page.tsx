import { AboutFooter } from "@/components/features/landingpage/about/about-footer";
import { AboutHeader } from "@/components/features/landingpage/about/about-header";
import { PartnersSection } from "@/components/features/landingpage/about/partners-section";

/**
 * Renders the About page with localized content and a list of partner cards.
 *
 * This server-rendered React component displays the about header, partners section
 * with introduction and partner cards, and footer with Erasmus funding information.
 *
 * @returns The About page JSX element
 */
export default async function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHeader />
      <PartnersSection />
      <AboutFooter />
    </main>
  );
}
