"use client";

import { useEffect, useState } from "react";

/**
 * Client-only wrapper component
 * Only renders children on the client side to avoid SSR issues
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

