import FooterSection from "@/components/features/landingpage/footer";
import { LandingHeader } from "@/components/features/landingpage/landing-header";
import { LandingPageGradients } from "@/components/features/landingpage/landing-page-gradients";

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
