"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/** 5 minutes in ms */
const DEFAULT_INACTIVITY_MS = 5 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export type InactivityLogoutOptions = {
  /** Inactivity duration before auto logout (default: 5 minutes) */
  inactivityMs?: number;
  /** Redirect path after logout (e.g. /cesworld/login) */
  redirectTo: string;
  /** Called to perform sign-out (e.g. robustSignOut or custom API). Should end session. */
  onLogout: () => void | Promise<void>;
  /** When false, inactivity timer is disabled (e.g. when user is not authenticated) */
  enabled?: boolean;
};

/**
 * Auto logout after a period of inactivity. Resets on user activity (mouse, keyboard, touch, scroll).
 * Use on dashboard pages so sessions end after 5 minutes of no interaction.
 */
export function useInactivityLogout({
  inactivityMs = DEFAULT_INACTIVITY_MS,
  redirectTo,
  onLogout,
  enabled = true,
}: InactivityLogoutOptions) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLogoutRef = useRef(onLogout);
  const redirectToRef = useRef(redirectTo);
  onLogoutRef.current = onLogout;
  redirectToRef.current = redirectTo;

  const logoutAndRedirect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const doLogout = async () => {
      try {
        await Promise.resolve(onLogoutRef.current());
      } catch {
        // ignore errors
      }
      try {
        localStorage.removeItem("bearer_token");
      } catch {
        // ignore
      }
      router.push(redirectToRef.current);
    };
    doLogout();
  }, [router]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(logoutAndRedirect, inactivityMs);
  }, [enabled, inactivityMs, logoutAndRedirect]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    resetTimer();
    const handleActivity = () => resetTimer();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, handleActivity);
    }
    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, handleActivity);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, resetTimer]);
}
