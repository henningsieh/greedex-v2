import { HeroHeader } from "@/components/header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeroHeader />
      {children}
    </>
  );
}
