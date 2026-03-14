import { Button } from "@/components/frontend/ui/button"

const locations = [
  { code: "us", country: "United States", ipCount: "3,948,181 IPs" },
  { code: "de", country: "Germany", ipCount: "3,506,009 IPs" },
  { code: "gb", country: "Britain", ipCount: "3,193,909 IPs" },
  { code: "ca", country: "Canada", ipCount: "3,183,779 IPs" },
  { code: "fr", country: "France", ipCount: "2,348,241 IPs" },
  { code: "in", country: "India", ipCount: "1,810,489 IPs" },
  { code: "kr", country: "South Korea", ipCount: "1,541,168 IPs" },
  { code: "jp", country: "Japan", ipCount: "1,210,396 IPs" },
]

export function LocationsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
            Access the World with Local-Quality Connections
          </h2>
          <p className="text-muted-foreground text-lg">
            Unlock worldwide IP access with our extensive range of IP servers in 195+ countries.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((location) => (
            <div
              key={location.country}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background/70">
                <img
                  src={`https://flagcdn.com/w80/${location.code}.png`}
                  alt={`${location.country} flag`}
                  className="h-9 w-12 rounded-sm object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-foreground text-xl font-semibold leading-tight">
                  {location.country}
                </p>
                <p className="text-muted-foreground text-2xl leading-tight mt-1">
                  {location.ipCount}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button type="button" className="rounded-full px-8">
            All locations &gt;
          </Button>
        </div>
      </div>
    </section>
  )
}
