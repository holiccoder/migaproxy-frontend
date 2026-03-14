import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { StaticResidentialHero } from "@/components/frontend/pricing/static-residential-hero"
import { StaticResidentialPricing } from "@/components/frontend/pricing/static-residential-pricing"
import { StaticResidentialFeatures } from "@/components/frontend/pricing/static-residential-features"
import { StaticResidentialUseCases } from "@/components/frontend/pricing/static-residential-use-cases"
import { StaticResidentialFaq } from "@/components/frontend/pricing/static-residential-faq"
import { StaticResidentialAlternatives } from "@/components/frontend/pricing/static-residential-alternatives"

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
  )
}
