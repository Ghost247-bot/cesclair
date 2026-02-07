"use client";

import Script from "next/script";

const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
const embedSrc =
  propertyId && widgetId
    ? `https://embed.tawk.to/${propertyId}/${widgetId}`
    : null;

/**
 * Tawk.to live chat widget.
 * Set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID in .env to enable.
 * Restart dev server or rebuild after changing env.
 */
export default function TawkChatWidget() {
  if (!embedSrc) return null;

  return (
    <>
      {/* Set Tawk globals before embed script runs (required by Tawk) */}
      <Script
        id="tawk-api-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {};
            var Tawk_LoadStart = new Date();
          `,
        }}
      />
      <Script
        id="tawk-embed"
        src={embedSrc}
        strategy="lazyOnload"
        charSet="UTF-8"
        crossOrigin="anonymous"
      />
    </>
  );
}
