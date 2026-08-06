"use client";

import { useFormStatus } from "react-dom";
import { updateOwnPersonalInfo } from "@/app/employee/documents/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type InitialData = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  residentialAddress: string;
  sinNumber: string;
  healthCardNumber: string;
  permitNumber: string;
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function PersonalInfoForm({ data }: { data: InitialData }) {
  const { t } = useLocale();
  return (
    <form action={updateOwnPersonalInfo} className="flex flex-col gap-3.5">
      <Field label={t("invite.fullName")}>
        <input name="fullName" required defaultValue={data.fullName} className={inputClasses} />
      </Field>
      <Field label={t("docs.dateOfBirth")}>
        <input
          type="date"
          name="dateOfBirth"
          defaultValue={data.dateOfBirth}
          className={inputClasses}
        />
      </Field>
      <Field label={t("form.phoneNumber")}>
        <input name="phone" defaultValue={data.phone} className={inputClasses} />
      </Field>
      <Field label={t("form.residentialAddress")}>
        <input
          name="residentialAddress"
          defaultValue={data.residentialAddress}
          className={inputClasses}
        />
      </Field>
      <Field label={t("form.sin")}>
        <input
          name="sinNumber"
          defaultValue={data.sinNumber}
          placeholder={t("form.sinPlaceholder")}
          className={inputClasses}
        />
      </Field>
      <Field label={t("form.healthCard")}>
        <input
          name="healthCardNumber"
          defaultValue={data.healthCardNumber}
          className={inputClasses}
        />
      </Field>
      <Field label={t("form.permitNumberOptional")}>
        <input
          name="permitNumber"
          defaultValue={data.permitNumber}
          className={inputClasses}
        />
      </Field>

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
      {pending ? t("common.saving") : t("form.saveMyInfo")}
    </button>
  );
}
