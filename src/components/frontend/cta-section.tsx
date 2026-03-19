import { Button } from "@/components/frontend/ui/button"
import { ArrowRight } from "lucide-react"
import homePageData from "@/data/home-page.json"

export function CtaSection() {
  const ctaData = homePageData.ctaSection

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl p-8 lg:p-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(34,197,94,0.1),transparent_50%)]" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              {ctaData.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {ctaData.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-base"
              >
                {ctaData.primaryButtonLabel}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 text-base border-border hover:bg-secondary bg-transparent"
              >
                {ctaData.secondaryButtonLabel}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
