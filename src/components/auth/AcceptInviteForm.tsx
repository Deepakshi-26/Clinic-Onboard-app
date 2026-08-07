"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setPassword, type SetPasswordState } from "@/app/accept-invite/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function AcceptInviteForm({ token }: { token: string }) {
  const { t } = useLocale();
  const [state, formAction] = useActionState<SetPasswordState, FormData>(
    setPassword,
    null
  );

  const errorText =
    state?.error === "passwordMismatch"
      ? t("acceptInvite.passwordMismatch")
      : state?.error === "passwordTooShort"
        ? t("acceptInvite.passwordTooShort")
        : state?.error === "invalidToken"
          ? t("acceptInvite.invalidLink")
          : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("acceptInvite.newPassword")}
        </span>
        <input
          type="password"
          name="password"
          minLength={8}
          required
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("acceptInvite.confirmPassword")}
        </span>
        <input
          type="password"
          name="confirmPassword"
          minLength={8}
          required
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      {errorText && <p className="text-xs text-red-600">{errorText}</p>}

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
      className="mt-1 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? t("acceptInvite.setting") : t("acceptInvite.setPassword")}
    </button>
  );
}
