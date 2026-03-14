import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/frontend/ui/accordion"

const faqs = [
  {
    question: "Is there a bandwidth limit?",
    answer:
      "Static residential plans include unlimited traffic and bandwidth with no caps.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Contact sales for trial availability and recommendations based on your use case.",
  },
  {
    question: "How are residential proxies different from datacenter proxies?",
    answer:
      "Residential proxies use ISP-assigned IPs for higher trust, while datacenter IPs are faster but easier to block.",
  },
]

export function StaticResidentialFaq() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Proxy Pricing FAQ
        </h2>
        <p className="text-muted-foreground">
          Answers to common questions about static residential proxies.
        </p>
      </div>
      <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card/70 p-6">
        <Accordion type="single" collapsible>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
