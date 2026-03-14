import { Button } from "@/components/frontend/ui/button"

const alternatives = [
  {
    title: "Rotating Residential Proxies",
    price: "Starting from $0.7/GB",
  },
  {
    title: "Rotating Mobile Proxies",
    price: "Starting from $2.52/GB",
  },
  {
    title: "Unlimited Residential Proxies",
    price: "Starting from $67.14/Day",
  },
  {
    title: "Custom Solutions",
    price: "Tailored enterprise needs",
  },
]

export function StaticResidentialAlternatives() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-28">
      <div className="rounded-2xl border border-border bg-card/70 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Alternative Proxy Services
            </h2>
            <p className="text-muted-foreground">
              Compare other plans that may better fit your workload.
            </p>
          </div>
          <Button variant="outline" className="rounded-full">
            Contact Us
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alternatives.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background/60 p-5"
            >
              <h3 className="text-base font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
