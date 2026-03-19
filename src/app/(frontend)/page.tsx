import type { Metadata } from "next";
import { CtaSection } from "@/components/frontend/cta-section";
import { FaqSection } from "@/components/frontend/faq-section";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { HeroSection } from "@/components/frontend/hero-section";
import { IntegrationsSection } from "@/components/frontend/integrations-section";
import { LatestBlogPostsSection } from "@/components/frontend/latest-blog-posts-section";
import { LocationsSection } from "@/components/frontend/locations-section";
import { ProductsSection } from "@/components/frontend/products-section";
import { StatsSection } from "@/components/frontend/stats-section";
import { TestimonialsSection } from "@/components/frontend/testimonials-section";
import { TrialSection } from "@/components/frontend/trial-section";
import { UseCasesSection } from "@/components/frontend/use-cases-section";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.home);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ProductsSection />
      <TrialSection />
      <UseCasesSection />
      <StatsSection />
      <IntegrationsSection />
      <LocationsSection />
      <TestimonialsSection />
      <FaqSection />
      <LatestBlogPostsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
