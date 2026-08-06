"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-zinc-700">
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1.5 text-[11px] font-bold ${
          locale === "en"
            ? "bg-teal-600 text-white"
            : "bg-white text-slate-500 dark:bg-zinc-950 dark:text-zinc-400"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("fr")}
        className={`px-2.5 py-1.5 text-[11px] font-bold ${
          locale === "fr"
            ? "bg-teal-600 text-white"
            : "bg-white text-slate-500 dark:bg-zinc-950 dark:text-zinc-400"
        }`}
      >
        FR
      </button>
    </div>
  );
}
