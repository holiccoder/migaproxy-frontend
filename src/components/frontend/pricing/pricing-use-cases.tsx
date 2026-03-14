import { ShieldCheck, Search, LineChart, Users } from "lucide-react"

const useCases = [
  {
    icon: ShieldCheck,
    title: "Ad Verification",
    description:
      "Confirm placements, detect fraud, and validate geo-specific campaigns.",
  },
  {
    icon: Search,
    title: "SEO Monitoring",
    description:
      "Track rankings and SERP features across locations without bias.",
  },
  {
    icon: LineChart,
    title: "Market Research",
    description:
      "Collect competitive intelligence and pricing signals at scale.",
  },
  {
    icon: Users,
    title: "Social Media Management",
    description:
      "Operate multiple accounts safely with residential session control.",
  },
]

export function PricingUseCases() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Popular Use Cases
        </h2>
        <p className="text-muted-foreground">
          Purpose-built for teams that rely on accurate, geo-diverse data.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {useCases.map((useCase) => (
          <div
            key={useCase.title}
            className="rounded-2xl border border-border bg-card/70 p-6"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <useCase.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {useCase.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
