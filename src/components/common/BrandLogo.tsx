"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  getFallbackFrontendLogoUrl,
  getFrontendLogoUrl,
} from "@/lib/branding"

type BrandLogoProps = {
  width: number
  height: number
  className?: string
  alt?: string
  priority?: boolean
}

export default function BrandLogo({
  width,
  height,
  className,
  alt = "MigaProxy Logo",
  priority = false,
}: BrandLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>(getFallbackFrontendLogoUrl())

  useEffect(() => {
    let isMounted = true

    void getFrontendLogoUrl().then((resolvedLogoUrl) => {
      if (isMounted) {
        setLogoUrl(resolvedLogoUrl)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Image
      src={logoUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={/^https?:\/\//i.test(logoUrl)}
    />
  )
}
