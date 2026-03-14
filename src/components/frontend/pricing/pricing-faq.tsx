import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/frontend/ui/accordion"

const faqs = [
  {
    question: "How is data usage measured?",
    answer:
      "Usage is based on total bandwidth consumed. Both successful and failed requests count toward usage.",
  },
  {
    question: "What billing cycles are available?",
    answer:
      "Plans are billed monthly by default. Annual commitments are available for enterprise contracts.",
  },
  {
    question: "Can I switch or upgrade plans anytime?",
    answer:
      "Yes. You can upgrade at any time. We’ll prorate the difference based on remaining balance.",
  },
  {
    question: "How fast is setup?",
    answer:
      "Provisioning is instant. Access credentials and endpoints are available immediately after purchase.",
  },
]

export function PricingFaq() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-28">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Pricing FAQ
        </h2>
        <p className="text-muted-foreground">
          Quick answers about usage, billing, and setup.
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
