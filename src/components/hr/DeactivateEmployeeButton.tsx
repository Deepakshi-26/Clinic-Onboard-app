"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateEmployee } from "@/app/hr/new-hire-info/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function DeactivateEmployeeButton({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`${t("newHire.deactivateConfirm")} ${employeeName}?`)) return;
    startTransition(async () => {
      await deactivateEmployee(employeeId);
      router.push("/hr/new-hire-info");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[11px] font-medium text-slate-500 hover:text-red-600 disabled:opacity-50"
    >
      {isPending ? t("common.saving") : `⏸️ ${t("newHire.deactivateEmployee")}`}
    </button>
  );
}
