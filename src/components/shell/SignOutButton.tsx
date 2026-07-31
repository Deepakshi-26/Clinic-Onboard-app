"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white"
    >
      Sign Out
    </button>
  );
}
