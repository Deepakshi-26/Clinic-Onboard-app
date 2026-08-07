"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function EmployeeSearchBox({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.delete("employeeId");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <input
      type="text"
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={t("common.searchPlaceholder")}
      className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}
