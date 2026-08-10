"use client";

import { useFormStatus } from "react-dom";
import { updateAccessCredential } from "@/app/hr/access/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type InitialData = {
  employeeId: string;
  location: string;
  workEmail: string;
  doorPasscode: string;
  buildingPasscode: string;
  wifiPassword: string;
  medexaUsername: string;
  medexaPassword: string;
  medexaLink: string;
  myleUsername: string;
  mylePassword: string;
  myleLink: string;
  equipmentBoxLocation: string;
  equipmentRequestEmail: string;
  trainerName: string;
  parkingEnabled: boolean;
  parkingNote: string;
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function AccessCredentialForm({ data }: { data: InitialData }) {
  const { t } = useLocale();
  return (
    <form action={updateAccessCredential} className="flex flex-col gap-3.5">
      <input type="hidden" name="employeeId" value={data.employeeId} />
      <input type="hidden" name="location" value={data.location} />

      <Field label={t("access.doorPasscode")}>
        <input name="doorPasscode" defaultValue={data.doorPasscode} className={inputClasses} />
      </Field>
      <Field label={t("access.buildingPasscode")}>
        <input
          name="buildingPasscode"
          defaultValue={data.buildingPasscode}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.wifiPassword")}>
        <input name="wifiPassword" defaultValue={data.wifiPassword} className={inputClasses} />
      </Field>
      <Field label={t("home.workEmail")}>
        <input
          type="email"
          name="workEmail"
          defaultValue={data.workEmail}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.medexaUsername")}>
        <input
          name="medexaUsername"
          defaultValue={data.medexaUsername}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.medexaPassword")}>
        <input
          name="medexaPassword"
          defaultValue={data.medexaPassword}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.medexaLink")}>
        <input
          type="url"
          name="medexaLink"
          defaultValue={data.medexaLink}
          placeholder="https://..."
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.myleUsername")}>
        <input name="myleUsername" defaultValue={data.myleUsername} className={inputClasses} />
      </Field>
      <Field label={t("access.mylePassword")}>
        <input name="mylePassword" defaultValue={data.mylePassword} className={inputClasses} />
      </Field>
      <Field label={t("access.myleLink")}>
        <input
          type="url"
          name="myleLink"
          defaultValue={data.myleLink}
          placeholder="https://..."
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.equipmentBoxLocation")}>
        <input
          name="equipmentBoxLocation"
          defaultValue={data.equipmentBoxLocation}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.equipmentRequestEmail")}>
        <input
          type="email"
          name="equipmentRequestEmail"
          defaultValue={data.equipmentRequestEmail}
          className={inputClasses}
        />
      </Field>
      <Field label={t("access.assignedTrainer")}>
        <input name="trainerName" defaultValue={data.trainerName} className={inputClasses} />
      </Field>

      <label className="flex items-center gap-2 border-t border-slate-100 pt-3.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
        <input
          type="checkbox"
          name="parkingEnabled"
          defaultChecked={data.parkingEnabled}
          className="h-4 w-4 accent-teal-600"
        />
        {t("access.showParking")}
      </label>
      <Field label={t("access.parkingNoteLabel")}>
        <input name="parkingNote" defaultValue={data.parkingNote} className={inputClasses} />
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
      {pending ? t("common.saving") : t("access.saveAndPush")}
    </button>
  );
}
