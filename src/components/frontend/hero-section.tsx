"use client"

import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Headphones, Shield, Zap } from "lucide-react"
import { GlobeVisualization } from "@/components/frontend/globe-visualization"
import homePageData from "@/data/home-page.json"

const featureIconMap = {
  Zap,
  Shield,
  Headphones,
} as const

export function HeroSection() {
  const heroData = homePageData.heroSection

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
                <span className="text-foreground">{heroData.heading.prefix}</span>
                <span className="text-primary">{heroData.heading.highlight}</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground">
                {heroData.subheading}
              </p>
              <p className="text-lg text-muted-foreground">
                {heroData.supportingText}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 lg:gap-10">
              {heroData.stats.map((stat) => (
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
                  {heroData.primaryCta.label}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <span className="mt-2 text-xs text-muted-foreground">
                  {heroData.primaryCta.supportText}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base border-border hover:bg-secondary bg-transparent"
                >
                  {heroData.secondaryCta.label}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <span className="mt-2 text-xs text-muted-foreground">
                  {heroData.secondaryCta.supportText}
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
          {heroData.featureCards.map((feature) => {
            const IconComponent = featureIconMap[feature.icon as keyof typeof featureIconMap]

            if (!IconComponent) {
              return null
            }

            return (
              <div
                key={feature.title}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
