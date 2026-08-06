"use client";

import { signOut } from "next-auth/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SignOutButton() {
  const { t } = useLocale();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white"
    >
      {t("shell.signOut")}
    </button>
  );
}
