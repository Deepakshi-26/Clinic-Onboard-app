"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadDocument, type UploadActionState } from "@/app/hr/documents/actions";
import { DOC_TYPES, jobTitleLabels, locationLabels } from "@/lib/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function DocumentUploadForm({
  employees,
}: {
  employees: { id: string; fullName: string }[];
}) {
  const { t, locale } = useLocale();
  const [state, formAction] = useActionState<UploadActionState, FormData>(
    uploadDocument,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <Field label={t("documents.documentName")}>
        <input
          name="name"
          required
          className={inputClasses}
          placeholder={t("documents.documentNamePlaceholder")}
        />
      </Field>

      <Field label={t("documents.documentType")}>
        <select name="docType" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            {t("common.selectEllipsis")}
          </option>
          {DOC_TYPES.map((docType) => (
            <option key={docType} value={docType}>
              {docType}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("documents.location")}>
        <select name="location" defaultValue="" className={inputClasses}>
          <option value="">{t("documents.allLocations")}</option>
          {Object.entries(locationLabels(locale)).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("documents.assignRoles")}
        </span>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Object.entries(jobTitleLabels(locale)).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs dark:border-zinc-700"
            >
              <input type="checkbox" name="roles" value={value} className="accent-teal-600" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("documents.assignSpecific")}
        </span>
        {employees.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {t("documents.noEmployeesYet")}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {employees.map((e) => (
              <label
                key={e.id}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs dark:border-zinc-700"
              >
                <input
                  type="checkbox"
                  name="employeeIds"
                  value={e.id}
                  className="accent-teal-600"
                />
                {e.fullName}
              </label>
            ))}
          </div>
        )}
      </div>

      <Field label={t("documents.filePdfDocx")}>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.doc,.docx"
          className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
        />
      </Field>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? t("common.uploading") : t("documents.uploadAndAssign")}
    </button>
  );
}
