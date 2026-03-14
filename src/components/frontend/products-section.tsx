"use client"

import { Button } from "@/components/frontend/ui/button"
import { ArrowRight, Globe, Server, Smartphone, Wifi, Infinity, Settings } from "lucide-react"

const products = [
  {
    icon: Globe,
    title: "Rotating Residential Proxies",
    description:
      "Real residential IPs from real devices with automatic IP rotation. Meet all your proxy needs for web scraping, ad verification and more.",
    features: [
      "Free city geo-targeting",
      "99.96% Success Rates",
      "Rotating/sticky sessions",
      "HTTP(S)/SOCKS5",
    ],
    price: "$0.75",
    unit: "GB",
    featured: true,
  },
  {
    icon: Wifi,
    title: "Static Residential Proxies",
    description:
      "Stable residential IPs simulating real users with the same IP address. Perfect for social media account management.",
    features: [
      "24/7 IP availability",
      "99.9% network uptime",
      "Unlimited traffic usage",
      "HTTP(S)/SOCKS5",
    ],
    price: "$2",
    unit: "IP",
    featured: false,
  },
  {
    icon: Server,
    title: "Datacenter Proxies",
    description:
      "Access global network through high-speed, stable datacenter proxies. Ideal for cost-effective web scraping projects.",
    features: [
      "Included rotating & static",
      "Sourced from top datacenter",
      "Fastest connection speed",
      "HTTP(S)/SOCKS5",
    ],
    price: "$0.3",
    unit: "GB",
    featured: false,
  },
  {
    icon: Smartphone,
    title: "Rotating Mobile Proxies",
    description:
      "Unblock anything with real mobile proxies, powered by top carriers to access the most toughest targets with 99.96% success rate.",
    features: [
      "99.9% network uptime",
      "Free precise geo-targeting",
      "Unlimited concurrency",
      "Support 5G/4G/3G/LTE",
    ],
    price: "$2.73",
    unit: "GB",
    featured: false,
  },
  {
    icon: Infinity,
    title: "Unlimited Residential Proxies",
    description:
      "Enjoy seamless browsing and scale web scraping tasks with unlimited traffic and bandwidth plans.",
    features: [
      "Unlimited traffic and IPs",
      "Unlimited concurrent requests",
      "200+ countries & regions",
      "Free continent geo-targeting",
    ],
    price: "$57.14",
    unit: "Day",
    featured: false,
  },
  {
    icon: Settings,
    title: "Custom Solutions",
    description:
      "Go beyond proxies, build your custom web scraping setup for e-commerce, SEO, and more.",
    features: [
      "Fully customized scraping workflows",
      "Scalable and cloud-based architecture",
      "Built-in proxy rotation",
      "Real-time data delivery",
    ],
    isCustom: true,
  },
]

export function ProductsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-medium mb-4">GoProxy Products</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Choose the Right Proxy for Every Need
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide a full range of proxy types and are building tailored web
            scraping solutions to make large-scale data access easier than ever.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.title}
              className={`relative bg-card border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 ${
                product.featured ? "border-primary" : "border-border"
              }`}
            >
              {product.featured && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <product.icon className="w-6 h-6 text-primary" />
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
                    <span className="text-sm text-muted-foreground">From </span>
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
                    Get Now
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button className="w-full rounded-full bg-secondary hover:bg-secondary/80">
                  Contact Us
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
