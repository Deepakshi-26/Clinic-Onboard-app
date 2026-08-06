"use client";

import { useFormStatus } from "react-dom";
import { updateOwnPersonalInfo } from "@/app/employee/documents/actions";

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
  return (
    <form action={updateOwnPersonalInfo} className="flex flex-col gap-3.5">
      <Field label="Full Name">
        <input name="fullName" required defaultValue={data.fullName} className={inputClasses} />
      </Field>
      <Field label="Date of Birth">
        <input
          type="date"
          name="dateOfBirth"
          defaultValue={data.dateOfBirth}
          className={inputClasses}
        />
      </Field>
      <Field label="Phone Number">
        <input name="phone" defaultValue={data.phone} className={inputClasses} />
      </Field>
      <Field label="Residential Address">
        <input
          name="residentialAddress"
          defaultValue={data.residentialAddress}
          className={inputClasses}
        />
      </Field>
      <Field label="Social Insurance Number (SIN)">
        <input
          name="sinNumber"
          defaultValue={data.sinNumber}
          placeholder="e.g. 123 456 789"
          className={inputClasses}
        />
      </Field>
      <Field label="Health / Membership Card Number">
        <input
          name="healthCardNumber"
          defaultValue={data.healthCardNumber}
          className={inputClasses}
        />
      </Field>
      <Field label="Permit Number (if applicable)">
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
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save My Information"}
    </button>
  );
}
