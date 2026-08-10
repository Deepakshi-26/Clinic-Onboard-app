"use client";

import { useState, useTransition } from "react";
import { resendInviteEmail } from "@/app/hr/new-hire-info/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ResendInviteButton({
  employeeId,
  accountActive,
}: {
  employeeId: string;
  accountActive: boolean;
}) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");

  const idleLabel = accountActive ? t("invite.sendPasswordReset") : t("invite.resendEmail");

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await resendInviteEmail(employeeId);
          setStatus(result.ok ? "sent" : "failed");
        })
      }
      disabled={isPending || status === "sent"}
      className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
    >
      {status === "sent"
        ? `✓ ${t("messages.sent")}`
        : status === "failed"
          ? `⚠️ ${t("messages.sendFailed")}`
          : `✉️ ${idleLabel}`}
    </button>
  );
}
