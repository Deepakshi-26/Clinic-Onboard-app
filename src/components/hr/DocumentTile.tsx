"use client";

import { useTransition } from "react";
import { deleteDocument } from "@/app/hr/documents/actions";
import { titleLabel } from "@/lib/labels";
import type { JobTitle } from "@prisma/client";

export function DocumentTile({
  id,
  name,
  docType,
  roles,
  assignedEmployeeName,
}: {
  id: string;
  name: string;
  docType: string;
  roles: JobTitle[];
  assignedEmployeeName: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  const scope = assignedEmployeeName
    ? assignedEmployeeName
    : roles.length > 0
      ? roles.map(titleLabel).join(", ")
      : "Nobody yet";

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xl">📄</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
          {name}
        </div>
        <div className="truncate text-[10px] text-slate-500 dark:text-zinc-400">
          {docType} · {scope}
        </div>
      </div>
      <button
        onClick={() => startTransition(() => deleteDocument(id))}
        disabled={isPending}
        className="flex-shrink-0 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
        title="Delete document"
      >
        {isPending ? "…" : "✕"}
      </button>
    </div>
  );
}
