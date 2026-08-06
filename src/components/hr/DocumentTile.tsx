"use client";

import { useState, useTransition } from "react";
import { deleteDocument, updateDocumentAssignment } from "@/app/hr/documents/actions";
import { jobTitleLabels, titleLabel } from "@/lib/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { JobTitle } from "@prisma/client";

type Employee = { id: string; fullName: string };

export function DocumentTile({
  id,
  name,
  docType,
  roles,
  assignedEmployees,
  allEmployees,
}: {
  id: string;
  name: string;
  docType: string;
  roles: JobTitle[];
  assignedEmployees: Employee[];
  allEmployees: Employee[];
}) {
  const { t, locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const assignedNames = assignedEmployees.map((e) => e.fullName);
  const scopeParts = [...roles.map((r) => titleLabel(r, locale)), ...assignedNames];
  const scope = scopeParts.length > 0 ? scopeParts.join(", ") : t("documents.nobodyYet");

  if (editing) {
    return (
      <form
        action={(formData) =>
          startTransition(async () => {
            await updateDocumentAssignment(formData);
            setEditing(false);
          })
        }
        className="rounded-lg border border-teal-300 bg-teal-50/40 p-3.5 dark:border-teal-800 dark:bg-teal-950/20"
      >
        <input type="hidden" name="documentId" value={id} />
        <div className="mb-2.5 text-xs font-semibold text-slate-900 dark:text-zinc-50">
          {t("documents.editingPrefix")} {name}
        </div>

        <div className="mb-2.5">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            {t("documents.roles")}
          </span>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(jobTitleLabels(locale)).map(([value, label]) => (
              <label key={value} className="flex items-center gap-1.5 text-[11px]">
                <input
                  type="checkbox"
                  name="roles"
                  value={value}
                  defaultChecked={roles.includes(value as JobTitle)}
                  className="accent-teal-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            {t("documents.specificPeople")}
          </span>
          <div className="flex flex-col gap-1">
            {allEmployees.map((e) => (
              <label key={e.id} className="flex items-center gap-1.5 text-[11px]">
                <input
                  type="checkbox"
                  name="employeeIds"
                  value={e.id}
                  defaultChecked={assignedEmployees.some((a) => a.id === e.id)}
                  className="accent-teal-600"
                />
                {e.fullName}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
          >
            {isPending ? t("common.saving") : t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

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
        onClick={() => setEditing(true)}
        className="flex-shrink-0 text-[11px] font-medium text-teal-600 hover:text-teal-700"
      >
        {t("common.edit")}
      </button>
      <button
        onClick={() => startTransition(() => deleteDocument(id))}
        disabled={isPending}
        className="flex-shrink-0 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
        title={t("documents.deleteTitle")}
      >
        {isPending ? "…" : "✕"}
      </button>
    </div>
  );
}
