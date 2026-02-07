"use client";

import RouteMessengerScript from "@/components/RouteMessengerScript";
import AntiCloneProtectionScript from "@/components/AntiCloneProtectionScript";
import { VisualEditsMessenger } from "@/visual-edits/VisualEditsMessenger";

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
