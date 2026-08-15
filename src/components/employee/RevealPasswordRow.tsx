"use client";

import { useState, useTransition } from "react";
import { revealAccessSecret } from "@/app/employee/access/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Location } from "@prisma/client";

export function RevealPasswordRow({
  label,
  hasValue,
  location,
  field,
}: {
  label: string;
  hasValue: boolean;
  location: Location;
  field: "medexaPassword" | "mylePassword";
}) {
  const { t } = useLocale();
  const [prompting, setPrompting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUnlock() {
    if (!confirmPassword) return;
    setError(null);
    startTransition(async () => {
      const result = await revealAccessSecret(location, field, confirmPassword);
      if (result.ok) {
        setValue(result.value);
        setPrompting(false);
        setConfirmPassword("");
      } else {
        setError(t(`access.revealError.${result.error}`));
      }
    });
  }

  return (
    <div className="border-b border-slate-50 py-2 text-xs last:border-0 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 dark:text-zinc-400">{label}</span>
        {!hasValue ? (
          <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-200">—</span>
        ) : value !== null ? (
          <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-200">{value}</span>
        ) : (
          <button
            type="button"
            onClick={() => setPrompting((p) => !p)}
            className="flex items-center gap-1 font-mono text-[11px] text-slate-800 hover:text-teal-600 dark:text-zinc-200"
          >
            🔒 ••••••••
          </button>
        )}
      </div>

      {prompting && value === null && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder={t("access.confirmPasswordPlaceholder")}
            autoFocus
            className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            onClick={handleUnlock}
            disabled={isPending || !confirmPassword}
            className="flex-shrink-0 rounded-md bg-teal-600 px-2.5 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
          >
            {t("access.unlock")}
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
