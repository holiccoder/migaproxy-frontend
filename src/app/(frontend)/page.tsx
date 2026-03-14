import { Header } from "@/components/frontend/header"
import { HeroSection } from "@/components/frontend/hero-section"
import { ProductsSection } from "@/components/frontend/products-section"
import { TrialSection } from "@/components/frontend/trial-section"
import { UseCasesSection } from "@/components/frontend/use-cases-section"
import { StatsSection } from "@/components/frontend/stats-section"
import { IntegrationsSection } from "@/components/frontend/integrations-section"
import { LocationsSection } from "@/components/frontend/locations-section"
import { TestimonialsSection } from "@/components/frontend/testimonials-section"
import { FaqSection } from "@/components/frontend/faq-section"
import { CtaSection } from "@/components/frontend/cta-section"
import { LatestBlogPostsSection } from "@/components/frontend/latest-blog-posts-section"
import { Footer } from "@/components/frontend/footer"

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
  )
}
