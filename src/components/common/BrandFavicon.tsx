"use client"

import { useEffect } from "react"
import {
  getFallbackFrontendFaviconUrl,
  getFrontendFaviconUrl,
} from "@/lib/branding"

const setFaviconHref = (href: string): void => {
  const relValues = ["icon", "shortcut icon", "apple-touch-icon"]

  relValues.forEach((relValue) => {
    let link = document.head.querySelector(
      `link[rel=\"${relValue}\"]`,
    ) as HTMLLinkElement | null

    if (!link) {
      link = document.createElement("link")
      link.rel = relValue
      document.head.appendChild(link)
    }

    link.href = href
  })
}

export default function BrandFavicon() {
  useEffect(() => {
    let isMounted = true

    setFaviconHref(getFallbackFrontendFaviconUrl())

    void getFrontendFaviconUrl().then((resolvedFaviconUrl) => {
      if (isMounted) {
        setFaviconHref(resolvedFaviconUrl)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return null
}
