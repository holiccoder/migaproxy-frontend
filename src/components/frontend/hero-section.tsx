"use client"

import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Headphones, Shield, Zap } from "lucide-react"
import { GlobeVisualization } from "@/components/frontend/globe-visualization"

const stats = [
  { value: "200+", label: "countries & regions" },
  { value: "99.96%", label: "success rate" },
  { value: "1GB", label: "starting from" },
]

const features = [
  {
    icon: Zap,
    title: "No more data limits",
    description: "Scrape websites efficiently and at scale without IP restrictions.",
  },
  {
    icon: Shield,
    title: "Effortless & Secure",
    description: "Experience fast and stable connections with absolute anonymity.",
  },
  {
    icon: Headphones,
    title: "Empower your business",
    description: "Support all the proxy service needs, from web scraping to ad verification.",
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 lg:pt-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Content */}
          <div className="space-y-8 pt-8 lg:pt-0">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                <span className="text-foreground">Fast Residential & </span>
                <span className="text-primary">Rotating Proxies</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground">
                Easy Global Reach
              </p>
              <p className="text-lg text-muted-foreground">
                Empower Your Data Tasks
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 lg:gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-base"
                >
                  Get Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <span className="mt-2 text-xs text-muted-foreground">
                  7-day Free Trial
                </span>
              </div>
              <div className="flex flex-col items-start">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base border-border hover:bg-secondary bg-transparent"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <span className="mt-2 text-xs text-muted-foreground">
                  24/7 Enterprise Support
                </span>
              </div>
            </div>
          </div>

          {/* Right - Globe Visualization */}
          <div className="relative h-[400px] lg:h-[600px]">
            <GlobeVisualization />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 pb-16 -mt-8 lg:mt-0">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
