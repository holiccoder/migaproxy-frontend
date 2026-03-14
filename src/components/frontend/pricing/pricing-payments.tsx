const paymentMethods = [
  "Visa",
  "Mastercard",
  "PayPal",
  "Google Pay",
  "Apple Pay",
  "Digital Wallets",
]

export function PricingPayments() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="rounded-2xl border border-border bg-card/70 p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Flexible Payments & Secure Checkout
            </h2>
            <p className="text-muted-foreground">
              Pay with cards or digital wallets. All transactions are encrypted
              and secured end-to-end.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm text-foreground"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
