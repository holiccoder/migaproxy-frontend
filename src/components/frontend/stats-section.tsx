import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Globe, Activity, Zap, Headphones } from "lucide-react"
import homePageData from "@/data/home-page.json"

const iconMap = {
  Globe,
  Activity,
  Zap,
  Headphones,
} as const

export function StatsSection() {
  const statsData = homePageData.statsSection

  return (
    <section className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {statsData.title}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.stats.map((stat) => {
            const IconComponent = iconMap[stat.icon as keyof typeof iconMap]

            if (!IconComponent) {
              return null
            }

            return (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-foreground font-medium mb-2">{stat.label}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-base">
            {statsData.ctaLabel}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
