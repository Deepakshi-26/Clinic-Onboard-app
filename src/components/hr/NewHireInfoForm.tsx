"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateEmployeeInfo,
  type UpdateEmployeeState,
} from "@/app/hr/new-hire-info/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type InitialData = {
  employeeId: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  personalEmail: string;
  residentialAddress: string;
  sinNumber: string;
  healthCardNumber: string;
  permitNumber: string;
  voidChequeUploaded: boolean;
  hrNotes: string;
};

const inputClasses =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-600 dark:bg-zinc-950";
const missingClasses = "border-red-400 bg-red-50 dark:bg-red-950/20";
const normalClasses = "border-slate-300 dark:border-zinc-700";

export function NewHireInfoForm({ data }: { data: InitialData }) {
  const { t } = useLocale();
  const [state, formAction] = useActionState<UpdateEmployeeState, FormData>(
    updateEmployeeInfo,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="employeeId" value={data.employeeId} />

      {state?.error === "emailInUse" && (
        <p className="text-xs text-red-600">{t("newHireForm.emailInUse")}</p>
      )}
      {state?.error === "forbidden" && (
        <p className="text-xs text-red-600">{t("newHireForm.forbidden")}</p>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3.5">
          <Field label={t("invite.fullName")}>
            <input
              name="fullName"
              defaultValue={data.fullName}
              className={`${inputClasses} ${normalClasses}`}
              required
            />
          </Field>
          <Field label={t("docs.dateOfBirth")}>
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={data.dateOfBirth}
              className={`${inputClasses} ${data.dateOfBirth ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label={t("form.phoneNumber")}>
            <input
              name="phone"
              defaultValue={data.phone}
              className={`${inputClasses} ${data.phone ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label={t("invite.personalEmail")}>
            <input
              type="email"
              name="personalEmail"
              defaultValue={data.personalEmail}
              className={`${inputClasses} ${normalClasses}`}
              required
            />
          </Field>
          <Field label={t("form.residentialAddress")}>
            <input
              name="residentialAddress"
              defaultValue={data.residentialAddress}
              className={`${inputClasses} ${
                data.residentialAddress ? normalClasses : missingClasses
              }`}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3.5">
          <Field label={t("newHireForm.sinNumber")}>
            <input
              name="sinNumber"
              defaultValue={data.sinNumber}
              placeholder={t("newHireForm.notSubmitted")}
              className={`${inputClasses} ${data.sinNumber ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label={t("newHireForm.healthCardHash")}>
            <input
              name="healthCardNumber"
              defaultValue={data.healthCardNumber}
              placeholder={t("newHireForm.notSubmitted")}
              className={`${inputClasses} ${
                data.healthCardNumber ? normalClasses : missingClasses
              }`}
            />
          </Field>
          <Field label={t("docs.permitNumber")}>
            <input
              name="permitNumber"
              defaultValue={data.permitNumber}
              placeholder={t("newHireForm.notSubmitted")}
              className={`${inputClasses} ${
                data.permitNumber ? normalClasses : missingClasses
              }`}
            />
          </Field>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="voidChequeUploaded"
              defaultChecked={data.voidChequeUploaded}
              className="h-4 w-4 accent-teal-600"
            />
            {t("newHireForm.voidChequeUploaded")}
          </label>
          <Field label={t("newHireForm.notes")}>
            <textarea
              name="hrNotes"
              defaultValue={data.hrNotes}
              rows={3}
              placeholder={t("newHireForm.notesPlaceholder")}
              className={`${inputClasses} ${normalClasses}`}
            />
          </Field>
        </div>
      </div>

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
      className="w-fit rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? t("common.saving") : t("newHireForm.saveChanges")}
    </button>
  );
}
