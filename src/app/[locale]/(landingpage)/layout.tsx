import FooterSection from "@/components/features/landingpage/footer";
import { LandingHeader } from "@/components/features/landingpage/landing-header";
import { LandingPageGradients } from "@/components/features/landingpage/landing-page-gradients";

/**
 * Layout wrapper that renders the landing page chrome and hosts page content.
 *
 * Renders background gradients, the landing header, the provided `children`, and the footer in a stacked layout.
 *
 * @param children - React nodes to be displayed as the main content of the landing page
 * @returns The composed landing page JSX element
 */
export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <LandingPageGradients />
      <div className="relative z-10">
        <LandingHeader />
        {children}
        <FooterSection />
      </div>
    </div>
  );
}
