"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { logIncident, type IncidentActionState } from "@/app/hr/incidents/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function IncidentLogForm() {
  const { t } = useLocale();
  const [state, formAction] = useActionState<IncidentActionState, FormData>(logIncident, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && <p className="text-xs text-red-600">{t("incidents.error")}</p>}

      <Field label={t("incidents.whatHappened")} required>
        <textarea name="whatHappened" required rows={3} className={inputClasses} />
      </Field>
      <Field label={t("incidents.whoAffected")}>
        <input name="whoAffected" className={inputClasses} />
      </Field>
      <Field label={t("incidents.actionsTaken")}>
        <textarea name="actionsTaken" rows={2} className={inputClasses} />
      </Field>
      <Field label={t("incidents.occurredAt")}>
        <input type="date" name="occurredAt" className={inputClasses} />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 self-start rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? t("incidents.saving") : t("incidents.logIt")}
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
