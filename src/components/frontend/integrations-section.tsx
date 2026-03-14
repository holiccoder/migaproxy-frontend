"use client"

import { useState } from "react"
import { Button } from "@/components/frontend/ui/button"
import { Copy, Check } from "lucide-react"
import { LogoMarquee } from "@/components/frontend/logo-marquee"

const products = [
  "Residential Proxies",
  "Static Residential Proxies",
  "Datacenter Proxies",
  "Mobile Proxies",
  "Unlimited Residential Proxies",
]

const codeExamples = {
  curl: `curl -U"customer-username:password" \\
  -x "proxy.goproxy.com:30000" \\
  "https://ipinfo.io"`,
  python: `import requests

proxies = {
    'http': 'http://customer-username:password@proxy.goproxy.com:30000',
    'https': 'http://customer-username:password@proxy.goproxy.com:30000'
}

response = requests.get('https://ipinfo.io', proxies=proxies)
print(response.text)`,
  nodejs: `const axios = require('axios');

const proxy = {
    host: 'proxy.goproxy.com',
    port: 30000,
    auth: {
        username: 'customer-username',
        password: 'password'
    }
};

axios.get('https://ipinfo.io', { proxy })
    .then(response => console.log(response.data));`,
  php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://ipinfo.io');
curl_setopt($ch, CURLOPT_PROXY, 'proxy.goproxy.com:30000');
curl_setopt($ch, CURLOPT_PROXYUSERPWD, 'customer-username:password');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
  go: `package main

import (
    "fmt"
    "net/http"
    "net/url"
)

func main() {
    proxyURL, _ := url.Parse("http://customer-username:password@proxy.goproxy.com:30000")
    client := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyURL)}}
    
    resp, _ := client.Get("https://ipinfo.io")
    defer resp.Body.Close()
}`,
}

const languages = ["curl", "python", "nodejs", "php", "go"] as const

export function IntegrationsSection() {
  const [selectedLanguage, setSelectedLanguage] =
    useState<(typeof languages)[number]>("curl")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[selectedLanguage])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Integration Tools
          </h2>
          <p className="text-muted-foreground text-lg">
            Get Started Quickly: Explore Our GoProxy Integration Guides.
          </p>
        </div>

        {/* Code Example */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Product Selector */}
            <div className="p-4 border-b border-border">
              <label className="text-sm text-muted-foreground mb-2 block">
                Choose product:
              </label>
              <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border">
                {products.map((product) => (
                  <option key={product}>{product}</option>
                ))}
              </select>
            </div>

            {/* Language Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-6 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    selectedLanguage === lang
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "nodejs" ? "NodeJs" : lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-6 text-sm text-muted-foreground overflow-x-auto">
                <code>{codeExamples[selectedLanguage]}</code>
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
            Trusted by Thousands Worldwide
          </h3>
          <p className="text-muted-foreground mb-12">
            Seamlessly working across thousands of applications and automation
            workflows.
          </p>

          <LogoMarquee />
        </div>
      </div>
    </section>
  )
}
