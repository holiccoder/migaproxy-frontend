import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Globe, Activity, Zap, Headphones } from "lucide-react"

const stats = [
  {
    icon: Globe,
    value: "90M+",
    label: "IPs",
    description: "Vast Global Proxy Network",
  },
  {
    icon: Activity,
    value: "99.9%",
    label: "Uptime",
    description: "Always-On Reliability",
  },
  {
    icon: Zap,
    value: "Zero",
    label: "IP Blocks",
    description: "Lightning-fast IP Allocation",
  },
  {
    icon: Headphones,
    value: "24/7",
    label: "Support",
    description: "Dedicated Service at Your Fingertips",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Power Your Business with Premium Proxies
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-foreground font-medium mb-2">{stat.label}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-base">
            Try it free
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
