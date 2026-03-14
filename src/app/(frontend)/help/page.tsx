import Link from "next/link"
import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import {
  BookOpen,
  Globe,
  LifeBuoy,
  ShieldCheck,
  Sliders,
  Zap,
} from "lucide-react"

const topics = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Setup guides, quick start, and onboarding best practices.",
    count: "12 articles",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    description: "Authentication, privacy, and compliance documentation.",
    count: "8 articles",
  },
  {
    icon: Globe,
    title: "Geo-Targeting",
    description: "Country, region, and city targeting capabilities.",
    count: "10 articles",
  },
  {
    icon: Sliders,
    title: "Proxy Configuration",
    description: "Session control, rotation, and connection settings.",
    count: "15 articles",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Success rates, latency, and optimization tips.",
    count: "9 articles",
  },
  {
    icon: LifeBuoy,
    title: "Billing & Plans",
    description: "Usage, invoices, upgrades, and account changes.",
    count: "11 articles",
  },
]

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            GoProxy
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Help Center</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers, guides, and best practices for using GoProxy.
          </p>
          <input
            type="search"
            placeholder="Search the Help Center"
            className="mx-auto w-full max-w-2xl rounded-full border border-border bg-card/70 px-6 py-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-2xl border border-border bg-card/70 p-6 hover:border-primary/40 transition-colors"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <topic.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {topic.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {topic.description}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {topic.count}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
