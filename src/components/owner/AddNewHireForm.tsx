"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitNewHire, type SubmitNewHireState } from "@/app/owner/new-hire/actions";
import { jobTitleLabels, locationLabels } from "@/lib/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function AddNewHireForm() {
  const { t, locale } = useLocale();
  const [state, formAction] = useActionState<SubmitNewHireState, FormData>(
    submitNewHire,
    null
  );

  return (
    <form action={formAction} key={state && "ok" in state ? "sent" : "form"} className="flex max-w-2xl flex-col gap-4">
      <Field label={t("owner.fullName")}>
        <input
          name="fullName"
          required
          className={inputClasses}
          placeholder={t("owner.fullNamePlaceholder")}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("invite.titleRole")}>
          <select name="title" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              {t("common.selectEllipsis")}
            </option>
            {Object.entries(jobTitleLabels(locale)).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("invite.primaryLocation")}>
          <select name="location" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              {t("common.selectEllipsis")}
            </option>
            {Object.entries(locationLabels(locale)).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("owner.personalEmail")} hint={t("owner.personalEmailHint")}>
          <input
            type="email"
            name="personalEmail"
            className={inputClasses}
            placeholder="jordan@example.com"
          />
        </Field>
        <Field label={t("owner.startDate")}>
          <input type="date" name="proposedStartDate" required className={inputClasses} />
        </Field>
      </div>

      <Field label={t("owner.notes")}>
        <textarea name="notes" rows={2} className={inputClasses} />
      </Field>

      {state && "error" in state && (
        <p className="text-xs text-red-600">{t("owner.submitError")}</p>
      )}
      {state && "ok" in state && (
        <p className="text-xs text-emerald-600">{t("owner.submitSuccess")}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-slate-400 dark:text-zinc-500">{hint}</span>}
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
      className="mt-1 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      ➕ {pending ? t("owner.submitting") : t("owner.submitButton")}
    </button>
  );
}
