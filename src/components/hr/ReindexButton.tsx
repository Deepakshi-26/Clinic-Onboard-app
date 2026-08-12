"use client";

import { useState, useTransition } from "react";
import { reindexAllDocuments } from "@/app/hr/documents/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ReindexButton() {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setDone(false);
          startTransition(async () => {
            await reindexAllDocuments();
            setDone(true);
          });
        }}
        className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
      >
        {isPending ? t("documents.reindexing") : t("documents.reindexForSearch")}
      </button>
      {done && (
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
          {t("documents.reindexDone")}
        </span>
      )}
    </div>
  );
}
