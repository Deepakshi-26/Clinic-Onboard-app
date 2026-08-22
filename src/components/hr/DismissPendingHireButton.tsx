"use client";

import { useState, useTransition } from "react";
import { dismissPendingHire } from "@/app/hr/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function DismissPendingHireButton({ pendingHireId }: { pendingHireId: string }) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await dismissPendingHire(pendingHireId);
          setDismissed(true);
        })
      }
      disabled={isPending}
      className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-red-400 hover:text-red-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
    >
      {isPending ? "…" : t("dashboard.dismiss")}
    </button>
  );
}
