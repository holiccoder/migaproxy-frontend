"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/frontend/ui/accordion"

const faqs = [
  {
    question: "Which proxy type should I choose?",
    answer:
      "Each proxy type is made for different use cases: Residential Proxy is best for general scraping and accessing geo-restricted content. Static Residential Proxy keeps the same IP - great for managing accounts. Mobile Proxy works through real mobile networks. Datacenter Proxy is fast and affordable for SEO monitoring or bulk requests.",
  },
  {
    question: "Is it legal to use proxies?",
    answer:
      "Yes, proxies themselves are completely legal. They're widely used for market research, SEO, ad verification, and privacy protection. Just make sure your usage follows each website's terms of service and local data laws.",
  },
  {
    question: "What if my IP doesn't work?",
    answer:
      "We've got you covered. You can request one free replacement within 24 hours after purchase if the static IP isn't working. If the issue is caused by our system, we'll credit the amount to your GoProxy wallet for future use.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! You can start with a trial plan to test our service. Individual users: Simply register and fill out your use case form. Once approved, your trial will be activated within 24-48 hours. Business users: Contact our sales team for larger or customized trial access.",
  },
  {
    question: "Why choose GoProxy?",
    answer:
      "GoProxy boasts an extensive pool of over 90 million IP addresses across 200+ countries, with an impressive success rate of 99.96%. We support HTTP, HTTPS, and SOCKS5 protocols, offer flexible pricing starting from 1GB, and provide 24/7 customer support.",
  },
]

export function FaqSection() {
  return (
    <section className="py-20 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
