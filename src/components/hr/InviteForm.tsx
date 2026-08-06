"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createInvite, type InviteActionState } from "@/app/hr/invite/actions";
import { jobTitleLabels, locationLabels } from "@/lib/labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

const TRAINERS = ["Dr. Leila Nouri", "Sarah Mitchell (HR)", "Tom Bergeron"];

export function InviteForm() {
  const { t, locale } = useLocale();
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    createInvite,
    null
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("invite.fullName")}>
          <input
            name="fullName"
            required
            className={inputClasses}
            placeholder={t("invite.fullNamePlaceholder")}
          />
        </Field>
        <Field label={t("invite.personalEmail")}>
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

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("invite.startDate")}>
          <input type="date" name="startDate" required className={inputClasses} />
        </Field>
        <Field label={t("invite.onboardingDuration")}>
          <select
            name="onboardingDurationDays"
            defaultValue="30"
            className={inputClasses}
          >
            <option value="30">{t("invite.days30")}</option>
            <option value="60">{t("invite.days60")}</option>
          </select>
        </Field>
      </div>

      <Field label={t("access.assignedTrainer")}>
        <input name="trainerName" list="trainers" className={inputClasses} />
        <datalist id="trainers">
          {TRAINERS.map((trainer) => (
            <option key={trainer} value={trainer} />
          ))}
        </datalist>
      </Field>

      <Field label={t("invite.welcomeMessage")}>
        <textarea
          name="welcomeMessage"
          rows={3}
          className={inputClasses}
          placeholder={t("invite.welcomeMessagePlaceholder")}
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
  const { t } = useLocale();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      ✉️ {pending ? t("invite.sending") : t("invite.sendInvitation")}
    </button>
  );
}
