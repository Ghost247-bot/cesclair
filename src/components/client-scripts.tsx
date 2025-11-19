"use client";

import dynamic from "next/dynamic";

// Dynamically import client components to avoid SSR issues
const RouteMessengerScript = dynamic(() => import("@/components/RouteMessengerScript"), {
  ssr: false,
});

const AntiCloneProtectionScript = dynamic(() => import("@/components/AntiCloneProtectionScript"), {
  ssr: false,
});

const VisualEditsMessenger = dynamic(
  async () => {
    try {
      const mod = await import("@/visual-edits/VisualEditsMessenger");
      // Handle both named export (VisualEditsMessenger) and default export (HoverReceiver)
      return mod.VisualEditsMessenger 
        ? { default: mod.VisualEditsMessenger }
        : { default: mod.default };
    } catch (error) {
      console.error("Failed to load VisualEditsMessenger:", error);
      // Return a no-op component if import fails
      return { default: () => null };
    }
  },
  {
    ssr: false,
  }
);

/**
 * Client-side scripts wrapper component
 * Contains all components that should only run on the client side
 */
export default function ClientScripts() {
  return (
    <>
      <RouteMessengerScript />
      <AntiCloneProtectionScript />
    </>
  );
}

/**
 * Separate component for VisualEditsMessenger to place it after Footer
 */
export function ClientScriptsFooter() {
  return <VisualEditsMessenger />;
}

