const features = [
  {
    title: "Real IP Address",
    description: "Authentic residential ISP IPs for trusted access.",
  },
  {
    title: "Higher Stability",
    description: "Long-term, stable connections for persistent sessions.",
  },
  {
    title: "Unlimited Traffic and Bandwidth",
    description: "No data caps or throttling for heavy workloads.",
  },
  {
    title: "No IP Blocking",
    description: "High success rates for restricted content access.",
  },
  {
    title: "Up to 99.9% Uptime",
    description: "Reliable availability backed by resilient infrastructure.",
  },
  {
    title: "Proxy Replacement Service",
    description: "Swap IPs quickly if issues arise.",
  },
]

export function StaticResidentialFeatures() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Key Features & Benefits
        </h2>
        <p className="text-muted-foreground">
          Built for stability, privacy, and uninterrupted performance.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-card/70 p-6"
          >
            <h3 className="text-base font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
