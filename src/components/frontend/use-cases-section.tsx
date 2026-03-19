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
import homePageData from "@/data/home-page.json"

const iconMap = {
  Database,
  DollarSign,
  Search,
  Eye,
  Users,
  Brain,
  Globe,
  Activity,
  SiGoogle,
  SiAmazon,
  BiLogoBing,
  SiAirbnb,
  SiYoutube,
  SiNetflix,
  SiTiktok,
} as const

export function UseCasesSection() {
  const useCasesData = homePageData.useCasesSection
  const [activeTab, setActiveTab] = useState<"useCase" | "target">("useCase")
  const useCaseTabLabel =
    useCasesData.tabs.find((tab) => tab.id === "useCase")?.label ?? ""
  const targetTabLabel =
    useCasesData.tabs.find((tab) => tab.id === "target")?.label ?? ""
  const activeItems = activeTab === "useCase" ? useCasesData.useCases : useCasesData.targetCases

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-primary font-medium mb-4">{useCasesData.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {useCasesData.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {useCasesData.description}
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
              {useCaseTabLabel}
            </button>
            <button
              onClick={() => setActiveTab("target")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "target"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {targetTabLabel}
            </button>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap]

            if (!IconComponent) {
              return null
            }

            return (
              <div
                key={item.title}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
