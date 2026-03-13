"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/frontend/ui/button"
import { AnnouncementBar } from "@/components/frontend/announcement-bar"

const navItems = [
  {
    label: "Proxies",
    items: [
      { label: "Residential Proxies", href: "#" },
      { label: "Static Residential Proxies", href: "#" },
      { label: "Mobile Proxies", href: "#" },
      { label: "Datacenter Proxies", href: "#" },
      { label: "Unlimited Residential Proxies", href: "#" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Web Scraping Service", href: "#" },
      { label: "Scraping Proxies", href: "#" },
      { label: "SERP API", href: "#", badge: "NEW" },
    ],
  },
  {
    label: "Get Pricing",
    items: [
      { label: "Residential Proxies", href: "#" },
      { label: "Static Residential Proxies", href: "#" },
      { label: "Mobile Proxies", href: "#" },
      { label: "Datacenter Proxies", href: "#" },
      { label: "Unlimited Residential Proxies", href: "#" },
      { label: "All Pricing", href: "#" },
    ],
  },
  { label: "Locations", href: "#" },
  {
    label: "Resources",
    items: [
      { label: "Blog", href: "#" },
      { label: "Affiliate Program", href: "#" },
      { label: "Partner", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "API Document", href: "#" },
    ],
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <AnnouncementBar />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-foreground">GoProxy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.items && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.items ? (
                  <button className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.items && openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="bg-card border border-border rounded-xl shadow-xl py-2 min-w-[220px]">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                        >
                          {subItem.label}
                          {subItem.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4">
            {navItems.map((item) => (
              <div key={item.label} className="py-2">
                {item.items ? (
                  <div>
                    <button className="flex items-center justify-between w-full py-2 text-foreground">
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="pl-4 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="block py-2 text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-3">
              <Button asChild variant="outline" className="w-full rounded-full bg-transparent">
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                Free Trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
