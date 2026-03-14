import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { PricingHero } from "@/components/frontend/pricing/pricing-hero"
import { PricingPlans } from "@/components/frontend/pricing/pricing-plans"
import { PricingFeatures } from "@/components/frontend/pricing/pricing-features"
import { PricingPayments } from "@/components/frontend/pricing/pricing-payments"
import { PricingUseCases } from "@/components/frontend/pricing/pricing-use-cases"
import { PricingFaq } from "@/components/frontend/pricing/pricing-faq"

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
  )
}
