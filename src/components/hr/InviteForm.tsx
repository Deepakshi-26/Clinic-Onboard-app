"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createInvite, type InviteActionState } from "@/app/hr/invite/actions";
import { JOB_TITLE_LABELS, LOCATION_LABELS } from "@/lib/labels";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

const TRAINERS = ["Dr. Leila Nouri", "Sarah Mitchell (HR)", "Tom Bergeron"];

export function InviteForm() {
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    createInvite,
    null
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name">
          <input name="fullName" required className={inputClasses} placeholder="e.g. Jordan Lee" />
        </Field>
        <Field label="Personal Email">
          <input
            type="email"
            name="personalEmail"
            required
            className={inputClasses}
            placeholder="jordan@example.com"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title / Role">
          <select name="title" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select...
            </option>
            {Object.entries(JOB_TITLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Primary Location">
          <select name="location" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select...
            </option>
            {Object.entries(LOCATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date">
          <input type="date" name="startDate" required className={inputClasses} />
        </Field>
        <Field label="Onboarding Duration (days)">
          <select
            name="onboardingDurationDays"
            defaultValue="30"
            className={inputClasses}
          >
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
          </select>
        </Field>
      </div>

      <Field label="Assigned Trainer">
        <input name="trainerName" list="trainers" className={inputClasses} />
        <datalist id="trainers">
          {TRAINERS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Field>

      <Field label="Personal Welcome Message (optional)">
        <textarea
          name="welcomeMessage"
          rows={3}
          className={inputClasses}
          placeholder="Welcome to the team! We're so excited to have you join us at the clinic..."
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
      className="mt-1 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? "Sending..." : "✉️ Send Invitation"}
    </button>
  );
}
