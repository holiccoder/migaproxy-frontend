import { Button } from "@/components/frontend/ui/button"

const durations = ["7 Days", "30 Days", "90 Days"]

const locations = [
  { name: "United States", tag: "Hot" },
  { name: "United Kingdom", tag: "Recommend" },
  { name: "France" },
  { name: "Germany" },
  { name: "Canada" },
  { name: "Netherlands", tag: "Hot" },
  { name: "Japan" },
  { name: "Australia" },
]

const highlights = [
  "Real Residential IP",
  "Higher Stability",
  "Unlimited Traffic and Bandwidth",
]

export function StaticResidentialPricing() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-border bg-card/70 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {durations.map((duration, index) => (
              <button
                key={duration}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  index === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {duration}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-4">
            Choose IP Location
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {locations.map((location) => (
              <div
                key={location.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground"
              >
                <span>{location.name}</span>
                {location.tag && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    {location.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-6 lg:p-8">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">
            $0.99{" "}
            <span className="text-base font-medium text-muted-foreground">
              / 7 Days
            </span>
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Elite Proxies plan
          </p>

          <div className="mt-6 space-y-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-full">Start Now</Button>
        </div>
      </div>
    </section>
  )
}
