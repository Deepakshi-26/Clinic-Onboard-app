"use client";

import type { Step } from "@/lib/progress";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function StepBar({ steps }: { steps: Step[] }) {
  const { t } = useLocale();
  return (
    <div className="mb-5 flex">
      {steps.map((step, i) => (
        <div key={step.labelKey} className="relative flex-1 text-center">
          {i < steps.length - 1 && (
            <div
              className={`absolute top-3.5 left-1/2 h-0.5 w-full ${
                step.status === "done" ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-800"
              }`}
            />
          )}
          <div
            className={`relative z-10 mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ${
              step.status === "done"
                ? "bg-emerald-500"
                : step.status === "active"
                  ? "bg-teal-600"
                  : "bg-slate-300 dark:bg-zinc-700"
            }`}
          >
            {step.status === "done" ? "✓" : i + 1}
          </div>
          <div
            className={`text-[10px] ${
              step.status === "done"
                ? "text-emerald-600"
                : step.status === "active"
                  ? "font-semibold text-teal-600"
                  : "text-slate-400 dark:text-zinc-500"
            }`}
          >
            {t(step.labelKey)}
          </div>
        </div>
      ))}
    </div>
  );
}
