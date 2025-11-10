import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import HeaderNavigation from "@/components/sections/header-navigation";
import Script from "next/script";
import RouteMessengerScript from "@/components/RouteMessengerScript";

export const metadata: Metadata = {
  title: "Cesclair-Modern Fashion",
  description: "fashion for everyone",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
      </body>
    </html>
  );
}