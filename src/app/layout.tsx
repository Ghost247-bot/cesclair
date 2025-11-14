import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dashboard-responsive.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import HeaderNavigation from "@/components/sections/header-navigation";
import Script from "next/script";
import RouteMessengerScript from "@/components/RouteMessengerScript";
import { Toaster } from "@/components/ui/sonner";
import { StructuredData } from "@/components/seo/structured-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';

export const metadata: Metadata = {
  title: {
    default: "Cesclair - Modern Fashion for Everyone",
    template: "%s | Cesclair"
  },
  description: "Discover modern, sustainable fashion for everyone. Shop high-quality clothing, accessories, and more at Cesclair. Ethical fashion that looks good and feels great.",
  keywords: ["fashion", "clothing", "sustainable fashion", "ethical fashion", "modern fashion", "womens fashion", "mens fashion", "accessories", "Cesclair"],
  authors: [{ name: "Cesclair" }],
  creator: "Cesclair",
  publisher: "Cesclair",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cesclair",
    title: "Cesclair - Modern Fashion for Everyone",
    description: "Discover modern, sustainable fashion for everyone. Shop high-quality clothing, accessories, and more at Cesclair.",
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: "Cesclair - Modern Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cesclair - Modern Fashion for Everyone",
    description: "Discover modern, sustainable fashion for everyone. Shop high-quality clothing, accessories, and more at Cesclair.",
    images: [`${siteUrl}/icon.png`],
    creator: "@cesclair",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StructuredData />
        <ErrorReporter />
        <HeaderNavigation />
        <link rel="preconnect" href="https://slelguoygbfzlpylpxfs.supabase.co" />
        <link rel="dns-prefetch" href="https://slelguoygbfzlpylpxfs.supabase.co" />
        <Script
          id="route-messenger-script"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/route-messenger.js"
          strategy="lazyOnload"
          defer
        />
        <RouteMessengerScript />
        <Script
          id="anti-clone-protection"
          strategy="afterInteractive"
          defer
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                try {
                  // Disable right-click
                  document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    return false;
                  });
                  
                  // Disable text selection
                  document.addEventListener('selectstart', function(e) {
                    e.preventDefault();
                    return false;
                  });
                  
                  // Disable keyboard shortcuts
                  document.addEventListener('keydown', function(e) {
                    if (
                      e.key === 'F12' ||
                      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                      (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P'))
                    ) {
                      e.preventDefault();
                      return false;
                    }
                  });
                  
                  // Disable drag
                  document.addEventListener('dragstart', function(e) {
                    e.preventDefault();
                    return false;
                  });
                  
                  // Disable copy/cut
                  document.addEventListener('copy', function(e) {
                    e.preventDefault();
                    return false;
                  });
                  
                  document.addEventListener('cut', function(e) {
                    e.preventDefault();
                    return false;
                  });
                  
                  // Disable text selection via CSS
                  document.body.style.userSelect = 'none';
                  document.body.style.webkitUserSelect = 'none';
                  document.body.style.mozUserSelect = 'none';
                  document.body.style.msUserSelect = 'none';
                  
                } catch (error) {
                  if (process.env.NODE_ENV === 'development') {
                    console.error('Anti-clone protection error:', error);
                  }
                }
              })();
            `,
          }}
        />
        {children}
        <VisualEditsMessenger />
        <Toaster />
      </body>
    </html>
  );
}