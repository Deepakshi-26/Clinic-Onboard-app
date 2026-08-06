"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadDocument, type UploadActionState } from "@/app/hr/documents/actions";
import { DOC_TYPES, JOB_TITLE_LABELS } from "@/lib/labels";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function DocumentUploadForm({
  employees,
}: {
  employees: { id: string; fullName: string }[];
}) {
  const [state, formAction] = useActionState<UploadActionState, FormData>(
    uploadDocument,
    null
  );
  const [assignMode, setAssignMode] = useState<"roles" | "employee">("roles");

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <Field label="Document Name">
        <input name="name" required className={inputClasses} placeholder="e.g. MEDEXA Therapist Guide" />
      </Field>

      <Field label="Document Type">
        <select name="docType" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            Select...
          </option>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          Assign To
        </span>
        <div className="mb-2.5 flex gap-1.5 rounded-lg bg-slate-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setAssignMode("roles")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
              assignMode === "roles"
                ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            By Role
          </button>
          <button
            type="button"
            onClick={() => setAssignMode("employee")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
              assignMode === "employee"
                ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            Specific Employee
          </button>
        </div>

        {assignMode === "roles" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(JOB_TITLE_LABELS).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs dark:border-zinc-700"
              >
                <input type="checkbox" name="roles" value={value} className="accent-teal-600" />
                {label}
              </label>
            ))}
          </div>
        ) : (
          <select name="assignedEmployeeId" defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select an employee...
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
        )}
      </div>

      <Field label="File (PDF, DOCX — up to 20MB)">
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
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Upload & Assign"}
    </button>
  );
}
