"use client"

import { useState } from "react"

const defaultItems = [
  "All",
  "Announcements",
  "Guides",
  "Case Studies",
  "Industry",
  "Updates",
]

export function PillButtons() {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {defaultItems.map((label, index) => {
        const isActive = index === active
        return (
          <button
            key={label}
            type="button"
            onClick={() => setActive(index)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
