import type { Metadata } from 'next';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ENV } from '@/config/env';
import AffiliateAttributionTracker from '@/components/common/AffiliateAttributionTracker';
import BrandFavicon from '@/components/common/BrandFavicon';
import { Suspense } from 'react';

export const metadata: Metadata = {
  robots: ENV.ALLOW_SEARCH_ENGINE_SPIDERS
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          nosnippet: true,
        },
      },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-gray-900">
        <Suspense fallback={null}>
          <AffiliateAttributionTracker />
        </Suspense>
        <BrandFavicon />
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  );
}
