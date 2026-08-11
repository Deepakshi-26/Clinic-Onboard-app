"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

// Sensitive employee data (SIN, health card numbers) sits behind these
// sessions — auto-logout after inactivity limits the window an unattended,
// unlocked device stays signed in.
export function IdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, IDLE_LIMIT_MS);
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
}
