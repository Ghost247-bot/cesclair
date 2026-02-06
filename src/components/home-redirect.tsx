"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Non-blocking redirect: checks session in background,
 * redirects designers/admins away from home page.
 * Renders nothing — does not block page paint.
 */
export default function HomeRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const redirectChecked = useRef(false);

  useEffect(() => {
    if (redirectChecked.current || isPending) return;
    if (session?.user) {
      redirectChecked.current = true;
      const role = (session.user as any)?.role || "member";
      if (role === "designer") {
        router.push("/designers/dashboard");
      } else if (role === "admin") {
        router.push("/admin");
      }
    }
  }, [session, isPending, router]);

  return null;
}
