const useCases = [
  {
    title: "Account Management",
    description: "Operate multiple accounts with steady, trusted IP sessions.",
  },
  {
    title: "Ecommerce Strategy",
    description: "Monitor competitors and manage storefront intelligence.",
  },
  {
    title: "Brand Protection",
    description: "Track counterfeit listings and unauthorized sellers.",
  },
  {
    title: "SEO & SERP Testing",
    description: "Validate rankings and visibility across locations.",
  },
]

export function StaticResidentialUseCases() {
  return (
    <section className="container mx-auto px-4 lg:px-8 pb-16 lg:pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Popular Use Cases
        </h2>
        <p className="text-muted-foreground">
          Designed for teams that need stable, long-lived connections.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {useCases.map((useCase) => (
          <div
            key={useCase.title}
            className="rounded-2xl border border-border bg-card/70 p-6"
          >
            <h3 className="text-base font-semibold text-foreground mb-2">
              {useCase.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
