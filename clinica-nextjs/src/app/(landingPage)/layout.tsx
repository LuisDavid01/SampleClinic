
import { Footer } from "@/components/Footer";
import { LandingPageHeader } from "@/components/LandingPageHeader";

export default async function landingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingPageHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
