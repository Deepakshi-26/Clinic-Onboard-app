"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveOrgSettings, type SettingsActionState } from "@/app/hr/settings/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function OrgSettingsForm({
  clinicName,
  privacyOfficerName,
  privacyOfficerEmail,
  opsLeadName,
  opsLeadEmail,
}: {
  clinicName: string;
  privacyOfficerName: string;
  privacyOfficerEmail: string;
  opsLeadName: string;
  opsLeadEmail: string;
}) {
  const { t } = useLocale();
  const [state, formAction] = useActionState<SettingsActionState, FormData>(
    saveOrgSettings,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && "error" in state && (
        <p className="text-xs text-red-600">{t("settings.error")}</p>
      )}
      {state && "ok" in state && (
        <p className="text-xs text-emerald-600">{t("settings.saved")}</p>
      )}

      <Field label={t("settings.clinicName")} hint={t("settings.clinicNameHint")}>
        <input name="clinicName" defaultValue={clinicName} className={inputClasses} />
      </Field>
      <Field label={t("settings.privacyOfficerName")} hint={t("settings.privacyOfficerNameHint")}>
        <input name="privacyOfficerName" defaultValue={privacyOfficerName} className={inputClasses} />
      </Field>
      <Field label={t("settings.privacyOfficerEmail")}>
        <input
          type="email"
          name="privacyOfficerEmail"
          defaultValue={privacyOfficerEmail}
          className={inputClasses}
        />
      </Field>
      <Field label={t("settings.opsLeadName")} hint={t("settings.opsLeadNameHint")}>
        <input name="opsLeadName" defaultValue={opsLeadName} className={inputClasses} />
      </Field>
      <Field label={t("settings.opsLeadEmail")}>
        <input
          type="email"
          name="opsLeadEmail"
          defaultValue={opsLeadEmail}
          className={inputClasses}
        />
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
      {pending ? t("settings.saving") : t("settings.save")}
    </button>
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
      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-400 dark:text-zinc-500">{hint}</span>}
    </label>
  );
}
