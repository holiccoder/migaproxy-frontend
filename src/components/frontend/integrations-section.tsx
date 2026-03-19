"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import homePageData from "@/data/home-page.json"
import { LogoMarquee } from "@/components/frontend/logo-marquee"
import { Button } from "@/components/frontend/ui/button"

export function IntegrationsSection() {
  const integrationsData = homePageData.integrationsSection
  const languageOptions = integrationsData.languages
  const codeExamples = integrationsData.codeExamples as Record<string, string>
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    languageOptions[0]?.id ?? ""
  )
  const [copied, setCopied] = useState(false)
  const selectedCodeExample = codeExamples[selectedLanguage] ?? ""

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCodeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {integrationsData.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {integrationsData.description}
          </p>
        </div>

        {/* Code Example */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Product Selector */}
            <div className="p-4 border-b border-border">
              <label className="text-sm text-muted-foreground mb-2 block">
                {integrationsData.productSelectorLabel}
              </label>
              <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border">
                {integrationsData.products.map((product) => (
                  <option key={product}>{product}</option>
                ))}
              </select>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {languageOptions.map((language) => (
                <button
                  key={language.id}
                  onClick={() => setSelectedLanguage(language.id)}
                  className={`px-6 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    selectedLanguage === language.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-6 text-sm text-muted-foreground overflow-x-auto">
                <code>{selectedCodeExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            {integrationsData.trustedBy.title}
          </h3>
          <p className="text-muted-foreground mb-12">
            {integrationsData.trustedBy.description}
          </p>

          <LogoMarquee />
        </div>
      </div>
    </section>
  )
}
