import type { Metadata } from "next";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { PricingFaq } from "@/components/frontend/pricing/pricing-faq";
import { PricingFeatures } from "@/components/frontend/pricing/pricing-features";
import { PricingHero } from "@/components/frontend/pricing/pricing-hero";
import { PricingPayments } from "@/components/frontend/pricing/pricing-payments";
import { PricingPlans } from "@/components/frontend/pricing/pricing-plans";
import { PricingUseCases } from "@/components/frontend/pricing/pricing-use-cases";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.residentialPricing);

export default function ResidentialProxiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <PricingHero />
      <PricingPlans />
      <PricingFeatures />
      <PricingPayments />
      <PricingUseCases />
      <PricingFaq />
      <Footer />
    </main>
  );
}
