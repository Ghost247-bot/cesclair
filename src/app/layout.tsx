import type { Metadata, Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import HeaderNavigation from "@/components/sections/header-navigation";
import Script from "next/script";
import RouteMessengerScript from "@/components/RouteMessengerScript";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Cesclair-Modern Fashion",  
  description: "fashion for everyone",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store'),
  openGraph: {
    title: "Cesclair-Modern Fashion",
    description: "fashion for everyone",
    type: "website",
    siteName: "Cesclair",
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
        <ErrorReporter />
        <HeaderNavigation />
        <Script
          id="route-messenger-script"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/route-messenger.js"
          strategy="afterInteractive"
        />
        <RouteMessengerScript />
        {children}
        <VisualEditsMessenger />
        <Toaster />
      </body>
    </html>
  );
}