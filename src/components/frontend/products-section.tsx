"use client"

import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Globe, Server, Smartphone, Wifi, Infinity, Settings } from "lucide-react"
import homePageData from "@/data/home-page.json"

const productIconMap = {
  Globe,
  Wifi,
  Server,
  Smartphone,
  Infinity,
  Settings,
} as const

export function ProductsSection() {
  const productsData = homePageData.productsSection

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-medium mb-4">{productsData.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {productsData.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {productsData.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsData.products.map((product) => {
            const IconComponent = productIconMap[product.icon as keyof typeof productIconMap]

            if (!IconComponent) {
              return null
            }

            return (
              <div
                key={product.title}
                className={`relative bg-card border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 ${
                  product.featured ? "border-primary" : "border-border"
                }`}
              >
                {product.featured && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    {productsData.featuredBadgeLabel}
                  </div>
                )}

                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {product.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-6 min-h-[60px]">
                  {product.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {!product.isCustom ? (
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">{productsData.pricePrefix} </span>
                      <span className="text-2xl font-bold text-primary">
                        {product.price}
                      </span>
                      <span className="text-muted-foreground">/{product.unit}</span>
                    </div>
                    <Button
                      className={`rounded-full ${
                        product.featured
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {productsData.ctaLabel}
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full rounded-full bg-secondary hover:bg-secondary/80">
                    {productsData.customCtaLabel}
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
