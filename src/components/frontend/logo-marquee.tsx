import { BiLogoBing } from "react-icons/bi"
import {
  FaAndroid,
  FaChrome,
  FaEdge,
  FaFirefoxBrowser,
  FaSafari,
  FaSlack,
  FaWindows,
  FaYahoo,
  FaYandex,
} from "react-icons/fa"
import { SiSelenium } from "react-icons/si"
import homePageData from "@/data/home-page.json"

const iconMap = {
  FaEdge,
  FaFirefoxBrowser,
  FaWindows,
  FaYandex,
  FaYahoo,
  FaSlack,
  FaAndroid,
  FaSafari,
  SiSelenium,
  FaChrome,
  BiLogoBing,
} as const

export function LogoMarquee() {
  const logoMarqueeData = homePageData.logoMarquee
  const doubled = [...logoMarqueeData.logos, ...logoMarqueeData.logos]

  return (
    <div className="space-y-4">
      {logoMarqueeData.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="logo-row">
          <div
            className={`logo-track ${
              row.direction === "left"
                ? "animate-marquee-left"
                : "animate-marquee-right"
            }`}
            style={{ ["--duration" as never]: `${row.duration}s` }}
          >
            {doubled.map((logo, index) => {
              const IconComponent = iconMap[logo.icon as keyof typeof iconMap]

              if (!IconComponent) {
                return null
              }

              return (
                <div key={`${logo.name}-${index}`} className="logo-tile">
                  <IconComponent
                    className="h-[100px] w-[100px] text-primary"
                    aria-label={logo.name}
                    title={logo.name}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
