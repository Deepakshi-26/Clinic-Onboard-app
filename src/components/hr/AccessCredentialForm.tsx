"use client";

import { useFormStatus } from "react-dom";
import { updateAccessCredential } from "@/app/hr/access/actions";

type InitialData = {
  employeeId: string;
  location: string;
  workEmail: string;
  doorPasscode: string;
  buildingPasscode: string;
  wifiPassword: string;
  medexaPassword: string;
  mylePassword: string;
  equipmentBoxLocation: string;
  equipmentRequestEmail: string;
  trainerName: string;
  parkingEnabled: boolean;
  parkingNote: string;
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function AccessCredentialForm({ data }: { data: InitialData }) {
  return (
    <form action={updateAccessCredential} className="flex flex-col gap-3.5">
      <input type="hidden" name="employeeId" value={data.employeeId} />
      <input type="hidden" name="location" value={data.location} />

      <Field label="Door Passcode">
        <input name="doorPasscode" defaultValue={data.doorPasscode} className={inputClasses} />
      </Field>
      <Field label="Building Passcode">
        <input
          name="buildingPasscode"
          defaultValue={data.buildingPasscode}
          className={inputClasses}
        />
      </Field>
      <Field label="Wi-Fi Password">
        <input name="wifiPassword" defaultValue={data.wifiPassword} className={inputClasses} />
      </Field>
      <Field label="Work Email">
        <input
          type="email"
          name="workEmail"
          defaultValue={data.workEmail}
          className={inputClasses}
        />
      </Field>
      <Field label="MEDEXA Password">
        <input
          name="medexaPassword"
          defaultValue={data.medexaPassword}
          className={inputClasses}
        />
      </Field>
      <Field label="Myle Password">
        <input name="mylePassword" defaultValue={data.mylePassword} className={inputClasses} />
      </Field>
      <Field label="Equipment Box Location">
        <input
          name="equipmentBoxLocation"
          defaultValue={data.equipmentBoxLocation}
          className={inputClasses}
        />
      </Field>
      <Field label="Equipment Request Email">
        <input
          type="email"
          name="equipmentRequestEmail"
          defaultValue={data.equipmentRequestEmail}
          className={inputClasses}
        />
      </Field>
      <Field label="Assigned Trainer">
        <input name="trainerName" defaultValue={data.trainerName} className={inputClasses} />
      </Field>

      <label className="flex items-center gap-2 border-t border-slate-100 pt-3.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
        <input
          type="checkbox"
          name="parkingEnabled"
          defaultChecked={data.parkingEnabled}
          className="h-4 w-4 accent-teal-600"
        />
        Show parking availability to this employee
      </label>
      <Field label="Parking Note (shown in employee's Access Info)">
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
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save & Push to Employee"}
    </button>
  );
}
