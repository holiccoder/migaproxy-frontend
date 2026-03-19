import type { Metadata } from "next";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { StaticResidentialAlternatives } from "@/components/frontend/pricing/static-residential-alternatives";
import { StaticResidentialFaq } from "@/components/frontend/pricing/static-residential-faq";
import { StaticResidentialFeatures } from "@/components/frontend/pricing/static-residential-features";
import { StaticResidentialHero } from "@/components/frontend/pricing/static-residential-hero";
import { StaticResidentialPricing } from "@/components/frontend/pricing/static-residential-pricing";
import { StaticResidentialUseCases } from "@/components/frontend/pricing/static-residential-use-cases";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.staticResidentialPricing);

export default function StaticResidentialProxiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <StaticResidentialHero />
      <StaticResidentialPricing />
      <StaticResidentialFeatures />
      <StaticResidentialUseCases />
      <StaticResidentialFaq />
      <StaticResidentialAlternatives />
      <Footer />
    </main>
  );
}
