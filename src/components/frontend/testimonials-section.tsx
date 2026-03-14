import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    quote: "Best Proxy Service",
    content:
      "Hello, really good proxy service. GoProxy is the best proxy service of the market currently, not re-sell proxy.",
    author: "HiuestDE",
    rating: 5,
  },
  {
    quote: "Helpful, Honest",
    content:
      "They tried very hard to get a solution working for my very specific purpose, including some custom settings. When we realized it would not work, they provided a full refund. Very courteous, honest.",
    author: "KarlCA",
    rating: 5,
  },
  {
    quote: "Very nice platform with advanced...",
    content:
      "Very nice platform with advanced features and easy to use, Reliable rotating proxies. Best platform available online.",
    author: "Mark W. MNL",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Let Customers Speak for Us
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <Quote className="w-8 h-8 text-primary/50 mb-4" />

              <h3 className="text-lg font-semibold text-foreground mb-3">
                {testimonial.quote}
              </h3>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-6 line-clamp-4">
                {testimonial.content}
              </p>

              <div className="text-sm font-medium text-foreground">
                {testimonial.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
