"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist, type WaitlistActionState } from "@/app/waitlist/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function WaitlistForm() {
  const { t } = useLocale();
  const [state, formAction] = useActionState<WaitlistActionState, FormData>(
    joinWaitlist,
    null
  );

  if (state && "ok" in state) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="text-3xl">🎉</div>
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
          {t("waitlist.successTitle")}
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          {t("waitlist.successBody")}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder={t("waitlist.emailPlaceholder")}
        className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      {state?.error && (
        <p className="text-xs text-red-600">{t("waitlist.error")}</p>
      )}
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
      className="rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? t("waitlist.joining") : t("waitlist.joinButton")}
    </button>
  );
}
