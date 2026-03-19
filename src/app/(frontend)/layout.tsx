import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/frontend/theme-provider";
import GlobalStructuredData from "@/components/seo/GlobalStructuredData";
import { createPageMetadata, frontendSeoPages } from "@/lib/seo/page-seo";
import "./globals.css";

export const metadata: Metadata = createPageMetadata(frontendSeoPages.home);

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-sans antialiased">
      <GlobalStructuredData />
      <ThemeProvider
        attribute="class"
        value={{ light: 'light', dark: 'dark' }}
        defaultTheme="light"
        enableColorScheme={false}
      >
        {children}
      </ThemeProvider>
    </div>
  );
}
