import Link from "next/link"
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react"
import BrandLogo from "@/components/common/BrandLogo"
import homePageData from "@/data/home-page.json"

const socialIconMap = {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} as const

export function Footer() {
  const footerData = homePageData.footer

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
              {footerData.description}
            </p>
            <div className="flex gap-4">
              {footerData.socialLinks.map((social) => {
                const SocialIcon =
                  socialIconMap[social.icon as keyof typeof socialIconMap]

                if (!SocialIcon) {
                  return null
                }

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                    aria-label={social.label}
                  >
                    <SocialIcon className="w-5 h-5 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerData.linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-foreground mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
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
            {footerData.copyright.symbol} {new Date().getFullYear()} {footerData.copyright.brand}. {footerData.copyright.suffix}
          </p>
          <div className="flex gap-6">
            {footerData.legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
