import Link from "next/link"
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react"
import BrandLogo from "@/components/common/BrandLogo"

const footerLinks = {
  Products: [
    { label: "Residential Proxies", href: "#" },
    { label: "Static Residential Proxies", href: "#" },
    { label: "Mobile Proxies", href: "#" },
    { label: "Datacenter Proxies", href: "#" },
    { label: "Unlimited Residential Proxies", href: "#" },
  ],
  Solutions: [
    { label: "Web Scraping", href: "#" },
    { label: "Ad Verification", href: "#" },
    { label: "SEO Monitoring", href: "#" },
    { label: "Social Media", href: "#" },
    { label: "Market Research", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#" },
    { label: "API Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Affiliate Program", href: "#" },
    { label: "Partner Program", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Refund Policy", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center">
              <BrandLogo
                width={154}
                height={35}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Quality & Affordable Proxies for your business needs. 90M+ IPs in
              200+ countries.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GoProxy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
