"use client";

import { useState, useTransition } from "react";
import { sendReminder } from "@/app/hr/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SendReminderButton({
  employeeId,
  employeeName,
  overdue,
}: {
  employeeId: string;
  employeeName: string;
  overdue: boolean;
}) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await sendReminder(employeeId);
          setSent(true);
        })
      }
      disabled={isPending || sent}
      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity disabled:opacity-60 ${
        overdue ? "bg-red-600" : "bg-amber-500"
      }`}
      title={`${t("messages.sendReminderTo")} ${employeeName}`}
    >
      {sent ? `✓ ${t("messages.sent")}` : `📧 ${t("messages.sendReminder")}`}
    </button>
  );
}
