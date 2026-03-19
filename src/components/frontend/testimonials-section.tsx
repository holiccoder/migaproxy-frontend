import { Quote, Star } from "lucide-react"
import homePageData from "@/data/home-page.json"

export function TestimonialsSection() {
  const testimonialsData = homePageData.testimonialsSection

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {testimonialsData.title}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonialsData.testimonials.map((testimonial) => (
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
