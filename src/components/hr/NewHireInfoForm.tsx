"use client";

import { useFormStatus } from "react-dom";
import { updateEmployeeInfo } from "@/app/hr/new-hire-info/actions";

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
  return (
    <form action={updateEmployeeInfo} className="flex flex-col gap-5">
      <input type="hidden" name="employeeId" value={data.employeeId} />

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3.5">
          <Field label="Full Name">
            <input
              name="fullName"
              defaultValue={data.fullName}
              className={`${inputClasses} ${normalClasses}`}
              required
            />
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              name="dateOfBirth"
              defaultValue={data.dateOfBirth}
              className={`${inputClasses} ${data.dateOfBirth ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label="Phone Number">
            <input
              name="phone"
              defaultValue={data.phone}
              className={`${inputClasses} ${data.phone ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label="Personal Email">
            <input
              type="email"
              name="personalEmail"
              defaultValue={data.personalEmail}
              className={`${inputClasses} ${normalClasses}`}
              required
            />
          </Field>
          <Field label="Residential Address">
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
          <Field label="SIN Number">
            <input
              name="sinNumber"
              defaultValue={data.sinNumber}
              placeholder="Not yet submitted"
              className={`${inputClasses} ${data.sinNumber ? normalClasses : missingClasses}`}
            />
          </Field>
          <Field label="Health / Membership Card #">
            <input
              name="healthCardNumber"
              defaultValue={data.healthCardNumber}
              placeholder="Not yet submitted"
              className={`${inputClasses} ${
                data.healthCardNumber ? normalClasses : missingClasses
              }`}
            />
          </Field>
          <Field label="Permit Number">
            <input
              name="permitNumber"
              defaultValue={data.permitNumber}
              placeholder="Not yet submitted"
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
            Void cheque uploaded
          </label>
          <Field label="Notes">
            <textarea
              name="hrNotes"
              defaultValue={data.hrNotes}
              rows={3}
              placeholder="Any HR notes about this employee..."
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
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}
