import { Button } from "@/components/frontend/ui/button"
import homePageData from "@/data/home-page.json"

export function LocationsSection() {
  const locationsData = homePageData.locationsSection

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
            {locationsData.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {locationsData.description}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {locationsData.locations.map((location) => (
            <div
              key={location.country}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background/70">
                <img
                  src={location.flagImageUrl}
                  alt={location.flagAlt}
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
            {locationsData.allLocationsButtonLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
