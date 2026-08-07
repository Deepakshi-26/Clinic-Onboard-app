"use client";

import { useTransition } from "react";
import { reactivateEmployee } from "@/app/hr/new-hire-info/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ReactivateEmployeeButton({ employeeId }: { employeeId: string }) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => reactivateEmployee(employeeId))}
      disabled={isPending}
      className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
    >
      {isPending ? t("common.saving") : `↩️ ${t("inactive.reactivate")}`}
    </button>
  );
}
