import React from "react"
import type { Metadata } from 'next'

import './globals.css'
import { ThemeProvider } from '@/components/frontend/theme-provider'

export const metadata: Metadata = {
  title: 'GoProxy | Quality & Affordable Proxies | Residential & Rotating',
  description: 'Fast Residential & Rotating Proxies with 90M+ IPs in 200+ countries. 99.96% success rate. Starting from $0.75/GB.',
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="font-sans antialiased">
      <ThemeProvider 
        attribute="class" 
        value={{ light: 'light', dark: 'dark' }}
        defaultTheme="light"
        enableColorScheme={false}
      >
        {children}
      </ThemeProvider>
    </div>
  )
}
