import { Header } from "@/components/frontend/header"
import { Footer } from "@/components/frontend/footer"
import { Button } from "@/components/frontend/ui/button"
import Link from "next/link"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              GoProxy
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Contact</span>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Contact Support
            </h1>
            <p className="text-lg text-muted-foreground">
              Reach out with business usage scenarios, technical questions, or
              specific concerns. Our team will respond promptly.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form className="rounded-2xl border border-border bg-card/70 p-6 lg:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Full Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Email<span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Telephone
                  </label>
                  <div className="mt-2 flex gap-3">
                    <select className="rounded-xl border border-border bg-background/60 px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>US +1</option>
                      <option>UK +44</option>
                      <option>CA +1</option>
                      <option>DE +49</option>
                      <option>FR +33</option>
                    </select>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Company or organization"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Question / Concern Description
                    <span className="text-red-500"> *</span>
                  </label>
                  <textarea
                    required
                    maxLength={500}
                    className="mt-2 h-36 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe your business usage scenario and related products (max 500 characters)."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button className="rounded-full bg-primary px-8">
                  Submit &gt;
                </Button>
              </div>
            </form>

            <aside className="rounded-2xl border border-border bg-card/70 p-6 h-fit">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Direct Contact
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-foreground font-medium">Email</p>
                  <p>support@goproxy.com</p>
                </div>
                <div>
                  <p className="text-foreground font-medium">WhatsApp</p>
                  <p>+852 4609 5505</p>
                </div>
                <div>
                  <p className="text-foreground font-medium">Telegram</p>
                  <p>+852 4609 5505</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Would you like help drafting a description of your business
                needs for this form?
              </p>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
