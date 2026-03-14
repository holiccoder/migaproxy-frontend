import { Button } from "@/components/frontend/ui/button"

const plans = [
  { name: "1GB", price: "$5", rate: "$5.00/GB" },
  { name: "3GB", price: "$12", rate: "$4.00/GB" },
  { name: "10GB", price: "$35", rate: "$3.50/GB" },
  { name: "25GB", price: "$75", rate: "$3.00/GB" },
  { name: "50GB", price: "$140", rate: "$2.80/GB" },
  { name: "100GB", price: "$270", rate: "$2.70/GB" },
  { name: "200GB", price: "$520", rate: "$2.60/GB" },
  { name: "500GB", price: "$1,250", rate: "$2.50/GB" },
  { name: "1000GB", price: "$1,600", rate: "$1.60/GB" },
  { name: "1500GB", price: "$1,275", rate: "$0.85/GB" },
  { name: "2000GB", price: "$1,500", rate: "$0.75/GB" },
  { name: "Custom", price: "Let’s Talk", rate: "Tailored rate" },
]

export function PricingPlans() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Tiered Pricing Plans
          </h2>
          <p className="text-muted-foreground">
            Scale from starter packs to enterprise-grade volume. Rates decrease
            as your usage grows.
          </p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-sm text-muted-foreground">As low as</p>
          <p className="text-2xl font-semibold text-primary">$0.75/GB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-border bg-card/70 p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              {plan.name === "2000GB" && (
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                  Best Rate
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {plan.price}
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.rate}</p>
            <Button className="w-full rounded-full" variant="outline">
              {plan.name === "Custom" ? "Contact Sales" : "Choose Plan"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
