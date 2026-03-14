import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { LocationsSection } from "@/components/frontend/locations-section"
import { AllCountriesSection } from "@/components/frontend/all-countries-section"
import Link from "next/link"

export default function ProxiesLocationPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-4 lg:pt-36">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            GoProxy
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Proxies Location</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Proxies Location
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore available proxy locations and IP volume across major regions.
          </p>
        </div>
      </section>
      <LocationsSection />
      <AllCountriesSection />
      <Footer />
    </main>
  )
}
