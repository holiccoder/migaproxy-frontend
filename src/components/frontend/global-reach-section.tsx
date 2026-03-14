import { Button } from "@/components/frontend/ui/button"

const ipCounts = [
  { country: "United States", count: "3,736,961 IPs" },
  { country: "Germany", count: "3,353,256 IPs" },
  { country: "Britain", count: "3,262,836 IPs" },
  { country: "Canada", count: "3,089,915 IPs" },
  { country: "France", count: "2,697,265 IPs" },
  { country: "India", count: "2,239,696 IPs" },
  { country: "South Korea", count: "1,356,707 IPs" },
  { country: "Japan", count: "1,044,668 IPs" },
]

export function GlobalReachSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary mb-4">
              Network Scale & Coverage
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Access the World with Local-Quality Connections
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Reach IP servers in over 195 countries with a massive, transparent
              pool of residential addresses across the world’s most demanded
              markets.
            </p>
            <div className="rounded-2xl border border-border bg-card/70 p-6">
              <h3 className="text-base font-semibold text-foreground mb-2">
                Total IP Transparency
              </h3>
              <p className="text-sm text-muted-foreground">
                Millions of high-quality IPs across key regions, updated
                continuously for reliability and scale.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground mb-4">
              <span>Country</span>
              <span>IP Count</span>
            </div>
            <div className="space-y-3">
              {ipCounts.map((row) => (
                <div
                  key={row.country}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm"
                >
                  <span className="text-foreground">{row.country}</span>
                  <span className="text-muted-foreground">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button className="rounded-full">All locations &gt;</Button>
        </div>
      </div>
    </section>
  )
}
