import { Button } from "@/components/frontend/ui/button"
import { Check, Gift, Zap } from "lucide-react"

const trialFeatures = [
  "Free 100MB rotating residential / mobile proxies",
  "Free 1 static residential / datacenter IP for 1 day",
  "Free 1GB rotating datacenter proxies",
]

const miniPlanFeatures = [
  "$4.99 for 1GB rotating residential proxies",
  "$2 for 1 static residential / datacenter IP",
  "$3 for 300MB rotating mobile proxies",
  "$5 for 5GB rotating datacenter proxies",
  "$20 for 1 hour unlimited residential proxies",
]

export function TrialSection() {
  return (
    <section className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Not Sure?
          </h2>
          <p className="text-muted-foreground text-lg">
            Try it free or start with just $2 (plus a $1 bonus for new users)
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Trial Card */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors flex h-full flex-col">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Gift className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">Enjoy full access to all features with our free trial:</h3>

          

            <ul className="space-y-3 mb-8">
              {trialFeatures.map((feature) => (
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
              Start Free Trial
            </Button>
          </div>

          {/* Mini Plan Card */}
          <div className="bg-card border border-primary rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              $1 Credit Bonus
            </div>

            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">
              Instant Access with Mini Plan
            </h3>

            <p className="text-muted-foreground mb-6">
              No Waiting. New users get $1 credit bonus to start right away:
            </p>

            <ul className="space-y-3 mb-8">
              {miniPlanFeatures.map((feature) => (
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
              Get $1 Credit
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
