import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/frontend/footer";
import { Header } from "@/components/frontend/header";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.partner);

const partnerCards = [
  {
    name: "Incogniton",
    description:
      "A famous anti-detect browser for multi-account management, allowing you to replace multiple computers with virtual browser profiles and assuring that your data is safe and private.",
    logo: "incogniton",
  },
  {
    name: "Dolphin-anty",
    description:
      "Antidetect browser for affiliate marketing purposes and much more.",
    logo: "dolphin",
  },
  {
    name: "Adspower",
    description:
      "An antidetect browser designed for managing multiple online accounts with maximum anonymity protection to prevent account bans.",
    logo: "adspower",
  },
  {
    name: "BrowserScan",
    description:
      "BrowserScan is a lightweight browser and plugin monitoring tool that helps administrators quickly identify potential security issues across their organization's web browsers.",
    logo: "browserscan",
  },
  {
    name: "Undetectable",
    description:
      "Undetectable browser - real fingerprints with high trust. Uptime 99.99%. Has API, mass extension installation and profile creation, cookie bot.",
    logo: "undetectable",
  },
  {
    name: "DICloak",
    description:
      "DICloak Antidetect Browser keeps your multi-account management safe and away from bans. Simplify multi-account operations and drive business growth at high speed and minimal cost with DICloak.",
    logo: "dicloak",
  },
  {
    name: "BitBrowser",
    description:
      "BitBrowser is an Anti-Detect Browser, Anti-Association Browser, Anti-Browser Fingerprint, and E-Commerce Browser. All business in BitBrowser, all business in your hands!",
    logo: "bitbrowser",
  },
  {
    name: "CapSolver",
    description:
      "Capsolver, renowned as the best captcha solver, deploys advanced AI and machine learning techniques to become the one-stop solution for bypassing captcha challenges seamlessly.",
    logo: "capsolver",
  },
  {
    name: "Hubstudio",
    description:
      "A free fingerprint browser and multi-account management system used by over 300,000 users, primarily for managing multiple social media and e-commerce accounts securely.",
    logo: "hubstudio",
  },
  {
    name: "Linken Sphere",
    description:
      "Linken Sphere is ideal for any work with multi-accounts, allowing you to improve work results and reliably protect your accounts from bans and blocking based on browser fingerprint parameters.",
    logo: "linkensphere",
  },
  {
    name: "MoreLogin",
    description:
      "MoreLogin is the world's first anti-detect vendor to launch a CloudPhone solution, offering a secure and efficient browser to protect your accounts, boost income, and support native fingerprints for traffic arbitration and affiliate marketing.",
    logo: "morelogin",
  },
  {
    name: "Boomlify",
    description:
      "Boomlify offers long-lasting disposable emails, multiple domains, no signup, custom addresses, cloud 2FA manager, cross-device access, and a developer API. Promo code: SAVE20",
    logo: "boomlify",
  },
  {
    name: "VMLogin",
    description:
      "Provide unlimited unique browser fingerprints to stop all your social media and e-commerce accounts banned. Try VMLogin Free.",
    logo: "vmlogin",
  },
  {
    name: "Hidemyacc",
    description:
      "Create unlimited accounts with different profiles in one device instead of using multi-real devices or virtual machines.",
    logo: "hidemyacc",
  },
  {
    name: "ixbrowser",
    description:
      "An anti-detect browser that helps you control your digital fingerprint parameters and create unlimited profiles for your multi-accounts.",
    logo: "ixbrowser",
  },
]

export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            MigaProxy
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Partner</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Partner Program
          </h1>
          <p className="text-lg text-muted-foreground">
            Collaborate with MigaProxy to unlock growth opportunities through referrals, integrations, and strategic partnerships.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {partnerCards.map((partner) => (
            <article key={partner.name}>
              <div className="rounded-2xl border border-border bg-card/70 p-8 h-64 flex items-center justify-center">
                {partner.logo === "incogniton" && (
                  <div className="relative h-28 w-28">
                    <span className="absolute left-8 top-0 h-16 w-12 rounded-full bg-fuchsia-500 rotate-12" />
                    <span className="absolute left-1 top-4 h-20 w-12 rounded-full bg-zinc-800 -rotate-20" />
                    <span className="absolute right-2 top-10 h-14 w-10 rounded-full bg-blue-700 rotate-45" />
                  </div>
                )}
                {partner.logo === "dolphin" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 text-2xl font-bold text-white">
                      D
                    </span>
                    <span className="text-3xl font-semibold text-foreground">
                      Dolphin{"{anty}"}
                    </span>
                  </div>
                )}
                {partner.logo === "adspower" && (
                  <div className="inline-flex h-32 w-32 items-center justify-center rounded-3xl bg-blue-600 text-6xl font-bold text-blue-100">
                    X
                  </div>
                )}
                {partner.logo === "browserscan" && (
                  <div className="flex h-40 w-full items-center justify-center rounded-xl bg-[#141748] px-6">
                    <span className="text-5xl font-medium text-white tracking-tight">
                      BrowserScan
                    </span>
                  </div>
                )}
                {partner.logo === "undetectable" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-400 text-3xl font-bold text-slate-600">
                      U
                    </span>
                    <span className="text-5xl font-semibold text-[#1e2b68]">
                      Undetectable
                    </span>
                  </div>
                )}
                {partner.logo === "dicloak" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900 text-3xl font-bold text-emerald-400">
                      D
                    </span>
                    <span className="text-5xl font-semibold tracking-wide text-zinc-900">
                      DICLOAK
                    </span>
                  </div>
                )}
                {partner.logo === "bitbrowser" && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="inline-flex h-28 w-24 items-center justify-center rounded-[40%] bg-gradient-to-br from-blue-400 to-indigo-700 text-6xl font-bold text-white">
                      B
                    </span>
                    <span className="text-5xl font-semibold text-indigo-950">
                      BitBrowser
                    </span>
                  </div>
                )}
                {partner.logo === "capsolver" && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="inline-flex h-28 w-28 items-center justify-center rounded-full border-[12px] border-green-500 text-5xl font-bold text-black">
                      C
                    </span>
                    <span className="text-5xl font-semibold text-black">
                      CapSolver
                    </span>
                  </div>
                )}
                {partner.logo === "hubstudio" && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="inline-flex h-28 w-28 items-center justify-center rounded-2xl bg-sky-500 text-5xl font-bold text-white">
                      H
                    </span>
                    <span className="text-5xl font-semibold text-sky-500">
                      Hub
                      <span className="text-indigo-950">studio</span>
                    </span>
                  </div>
                )}
                {partner.logo === "linkensphere" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-3xl font-bold text-zinc-900">
                      L
                    </span>
                    <span className="text-5xl font-medium text-zinc-900">
                      Linken Sphere
                    </span>
                  </div>
                )}
                {partner.logo === "morelogin" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-indigo-500 text-3xl font-bold text-white">
                      M
                    </span>
                    <span className="text-5xl font-semibold text-black">
                      MoreLogin
                    </span>
                  </div>
                )}
                {partner.logo === "boomlify" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-4xl font-bold text-white">
                      b
                    </span>
                    <span className="text-5xl font-semibold text-indigo-950">
                      boomlify
                    </span>
                  </div>
                )}
                {partner.logo === "vmlogin" && (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-[#0f2a5f] text-3xl font-bold text-cyan-300">
                      VM
                    </span>
                    <span className="text-5xl font-semibold tracking-wide text-[#0f2a5f]">
                      VMLOGIN
                    </span>
                  </div>
                )}
                {partner.logo === "hidemyacc" && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-[40%] bg-gradient-to-b from-slate-100 to-slate-300 text-4xl font-bold text-slate-700">
                      H
                    </span>
                    <span className="text-5xl font-semibold text-[#0b2f57]">
                      Hidemyacc
                    </span>
                  </div>
                )}
                {partner.logo === "ixbrowser" && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 via-yellow-300 to-green-400 text-5xl font-bold text-[#0f2a5f]">
                      IX
                    </span>
                    <span className="text-5xl font-semibold text-[#183a62]">
                      ixBrowser
                    </span>
                  </div>
                )}
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-foreground">{partner.name}</h2>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{partner.description}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
