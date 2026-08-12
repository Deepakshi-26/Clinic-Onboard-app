"use client";

import { useTransition } from "react";
import { deletePersonalDocument } from "@/app/employee/documents/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function PersonalDocumentTile({
  id,
  label,
  uploadedAt,
}: {
  id: string;
  label: string;
  uploadedAt: string;
}) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xl">📎</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
          {label}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
          {t("newHire.uploaded")} {uploadedAt}
        </div>
      </div>
      <a
        href={`/api/personal-documents/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-[11px] font-medium text-teal-600 hover:text-teal-700"
      >
        {t("common.view")}
      </a>
      <button
        onClick={() => startTransition(() => deletePersonalDocument(id))}
        disabled={isPending}
        className="flex-shrink-0 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
        title={t("docs.removeDocument")}
      >
        {isPending ? "…" : "✕"}
      </button>
    </div>
  );
}
