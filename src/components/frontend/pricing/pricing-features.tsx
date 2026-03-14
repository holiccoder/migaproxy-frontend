import { Activity, Globe, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Activity,
    title: "High success rates",
    description: "Consistent performance with fast response times at scale.",
  },
  {
    icon: Globe,
    title: "Global geo-targeting",
    description:
      "Target countries, regions, and cities with precision on-demand.",
  },
  {
    icon: Zap,
    title: "Unlimited concurrent sessions",
    description:
      "Run large parallel workloads without caps on concurrent connections.",
  },
  {
    icon: Shield,
    title: "Secure & private network",
    description:
      "Automatic rotation and privacy safeguards keep your traffic protected.",
  },
]

export function PricingFeatures() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Built for Performance, Flexibility, and Reliability
          </h2>
          <p className="text-muted-foreground">
            Residential proxies that keep your workflows fast, adaptive, and
            private—whether you run a few jobs or thousands.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card/70 p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
