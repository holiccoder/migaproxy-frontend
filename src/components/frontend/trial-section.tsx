import { Button } from "@/components/frontend/ui/button"
import { Check, Gift, Zap } from "lucide-react"
import homePageData from "@/data/home-page.json"

const iconMap = {
  Gift,
  Zap,
} as const

export function TrialSection() {
  const trialData = homePageData.trialSection
  const FreeTrialIcon = iconMap[trialData.freeTrialCard.icon as keyof typeof iconMap]
  const MiniPlanIcon = iconMap[trialData.miniPlanCard.icon as keyof typeof iconMap]

  return (
    <section className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {trialData.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {trialData.description}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Trial Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors flex h-full flex-col">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              {FreeTrialIcon && <FreeTrialIcon className="w-7 h-7 text-primary" />}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">{trialData.freeTrialCard.title}</h3>

            <ul className="space-y-3 mb-8">
              {trialData.freeTrialCard.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base py-6">
              {trialData.freeTrialCard.ctaLabel}
            </Button>
          </div>

          {/* Mini Plan Card */}
          <div className="bg-card border border-primary rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              {trialData.miniPlanCard.badge}
            </div>

            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              {MiniPlanIcon && <MiniPlanIcon className="w-7 h-7 text-primary" />}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">
              {trialData.miniPlanCard.title}
            </h3>

            <p className="text-muted-foreground mb-6">
              {trialData.miniPlanCard.description}
            </p>

            <ul className="space-y-3 mb-8">
              {trialData.miniPlanCard.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base py-6">
              {trialData.miniPlanCard.ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
