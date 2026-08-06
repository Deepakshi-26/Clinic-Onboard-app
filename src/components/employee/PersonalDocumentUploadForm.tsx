"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  uploadPersonalDocument,
  type UploadActionState,
} from "@/app/employee/documents/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950";

export function PersonalDocumentUploadForm() {
  const { t } = useLocale();
  const [state, formAction] = useActionState<UploadActionState, FormData>(
    uploadPersonalDocument,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("docs.whatIsDocument")}
        </span>
        <input
          name="label"
          required
          className={inputClasses}
          placeholder={t("docs.whatIsDocumentPlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
          {t("docs.fileImageOrPdf")}
        </span>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,.heic"
          className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
        />
      </label>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

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
      className="mt-1 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
    >
      {pending ? t("common.uploading") : t("docs.uploadDocumentBtn")}
    </button>
  );
}
