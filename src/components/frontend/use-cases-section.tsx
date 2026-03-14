"use client"

import { useState } from "react"
import {
  Database,
  DollarSign,
  Search,
  Eye,
  Users,
  Brain,
  Globe,
  Activity,
} from "lucide-react"
import {
  SiAirbnb,
  SiAmazon,
  SiGoogle,
  SiNetflix,
  SiTiktok,
  SiYoutube,
} from "react-icons/si"
import { BiLogoBing } from "react-icons/bi"

const useCases = [
  {
    icon: Database,
    title: "Web scraping & data aggregation",
    description:
      "Large-scale crawls harvest public web data (catalogs, directories, public listings).",
  },
  {
    icon: DollarSign,
    title: "Price intelligence & e-commerce monitoring",
    description:
      "Continuous or frequent checks of product pages and competitor pricing while avoiding CAPTCHA.",
  },
  {
    icon: Search,
    title: "SEO & SERP rank tracking",
    description:
      "Capture accurate, localized search engine results across countries/regions without location-based bias.",
  },
  {
    icon: Eye,
    title: "Ad verification & brand monitoring",
    description:
      "Mirror real-user environments and verify ad placements, creatives, viewability, and geo-targeted delivery.",
  },
  {
    icon: Users,
    title: "Social media management & account operations",
    description:
      "Manage multiple social accounts, scheduling, or automation works. Reduce flags and genuine device/locale behavior.",
  },
  {
    icon: Brain,
    title: "AI data collection & model training pipelines",
    description:
      "Collect large, geo-diverse datasets for model training, validation, or fine-tuning.",
  },
  {
    icon: Globe,
    title: "Geo-restricted content testing & localization QA",
    description: "Test region-specific experiences (pricing, content, app behavior).",
  },
  {
    icon: Activity,
    title: "Performance testing, API reliability & load simulations",
    description:
      "Use quality IPs for high-concurrency load tests or distributed API reliability checks.",
  },
]

const targetCases = [
  {
    icon: SiGoogle,
    title: "Google",
    description:
      "Achieve global search results and localization for tailored marketing.",
  },
  {
    icon: SiAmazon,
    title: "Amazon",
    description:
      "Access international marketplaces, monitor competitors, and optimize pricing strategies.",
  },
  {
    icon: BiLogoBing,
    title: "Bing",
    description:
      "Customize web searches to target specific regions and demographics effectively.",
  },
  {
    icon: SiAirbnb,
    title: "Airbnb",
    description:
      "List and book properties seamlessly across various countries.",
  },
  {
    icon: SiYoutube,
    title: "YouTube",
    description:
      "Evade content restrictions and access geographically restricted videos.",
  },
  {
    icon: SiNetflix,
    title: "Netflix",
    description:
      "Bypass content region locks and enjoy worldwide streaming content.",
  },
  {
    icon: SiTiktok,
    title: "TikTok",
    description:
      "Manage TikTok accounts seamlessly across multiple global regions with secure, stable access.",
  },
  {
    icon: Activity,
    title: "More Targets",
    description:
      "Use high-quality proxies to support diverse target scenarios and unlock broader possibilities.",
  },
]

export function UseCasesSection() {
  const [activeTab, setActiveTab] = useState<"useCase" | "target">("useCase")

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-primary font-medium mb-4">GoProxy Solutions</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Built for Every Use Case That Matters
          </h2>
          <p className="text-muted-foreground text-lg">
            Check out how enterprise and individuals use GoProxy to transform
            their digital operations.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-card border border-border rounded-full p-1">
            <button
              onClick={() => setActiveTab("useCase")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "useCase"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By use case
            </button>
            <button
              onClick={() => setActiveTab("target")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "target"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By target
            </button>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeTab === "useCase" ? useCases : targetCases).map((useCase) => (
            <div
              key={useCase.title}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <useCase.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
