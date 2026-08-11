"use client";

import { useVoiceTour } from "@/components/shell/VoiceTourOverlay";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function VoiceTourStartCard() {
  const { t } = useLocale();
  const { startTour } = useVoiceTour();

  return (
    <button
      onClick={startTour}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 px-5 py-4 text-left text-white shadow-md transition-transform hover:scale-[1.01]"
    >
      <div>
        <div className="text-sm font-bold">{t("voiceTour.homeCardTitle")}</div>
        <div className="mt-0.5 text-xs text-white/85">{t("voiceTour.homeCardBody")}</div>
      </div>
      <span className="flex-shrink-0 rounded-full bg-white/20 px-3.5 py-2 text-xs font-semibold whitespace-nowrap">
        {t("voiceTour.homeCardButton")} →
      </span>
    </button>
  );
}
