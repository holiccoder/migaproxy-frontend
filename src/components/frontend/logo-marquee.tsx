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

const logos = [
  { name: "Edge", icon: FaEdge },
  { name: "Firefox", icon: FaFirefoxBrowser },
  { name: "Windows", icon: FaWindows },
  { name: "Yandex", icon: FaYandex },
  { name: "Yahoo", icon: FaYahoo },
  { name: "Slack", icon: FaSlack },
  { name: "Android", icon: FaAndroid },
  { name: "Safari", icon: FaSafari },
  { name: "Selenium", icon: SiSelenium },
  { name: "Chrome", icon: FaChrome },
  { name: "Bing", icon: BiLogoBing },
]

const rows = [
  { direction: "left", duration: 30 },
  { direction: "right", duration: 34 },
  { direction: "left", duration: 32 },
]

export function LogoMarquee() {
  const doubled = [...logos, ...logos]

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="logo-row">
          <div
            className={`logo-track ${
              row.direction === "left"
                ? "animate-marquee-left"
                : "animate-marquee-right"
            }`}
            style={{ ["--duration" as never]: `${row.duration}s` }}
          >
            {doubled.map((logo, index) => (
              <div key={`${logo.name}-${index}`} className="logo-tile">
                <logo.icon
                  className="h-[100px] w-[100px] text-primary"
                  aria-label={logo.name}
                  title={logo.name}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
