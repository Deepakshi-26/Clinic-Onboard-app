"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type TourStepData = {
  id: string;
  icon: string;
  title: string;
  caption: string;
  href: string;
  audioBase64: string;
};

type Status = "idle" | "loading" | "playing" | "paused" | "done" | "error";

type VoiceTourContextValue = { startTour: () => void; activeStepHref: string | null };

const VoiceTourContext = createContext<VoiceTourContextValue | null>(null);

export function useVoiceTour() {
  const ctx = useContext(VoiceTourContext);
  if (!ctx) throw new Error("useVoiceTour must be used within VoiceTourOverlay");
  return ctx;
}

// Null-safe variant for components (like the sidebar nav) that render for
// both roles — HR pages aren't wrapped in VoiceTourOverlay at all, so this
// just quietly returns null there instead of throwing.
export function useActiveTourHref(): string | null {
  return useContext(VoiceTourContext)?.activeStepHref ?? null;
}

export function VoiceTourOverlay({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [steps, setSteps] = useState<TourStepData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playStep(stepList: TourStepData[], index: number) {
    audioRef.current?.pause();
    const step = stepList[index];
    if (!step) {
      setStatus("done");
      return;
    }
    router.push(step.href);
    const audio = new Audio(`data:audio/mp3;base64,${step.audioBase64}`);
    audioRef.current = audio;
    audio.onended = () => {
      const next = index + 1;
      if (next < stepList.length) {
        setCurrentIndex(next);
        playStep(stepList, next);
      } else {
        setStatus("done");
      }
    };
    audio.play();
    setStatus("playing");
  }

  async function startTour() {
    if (status === "loading" || status === "playing" || status === "paused") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/voice-tour", { method: "POST" });
      const rawText = await res.text();
      let body: { steps?: TourStepData[]; error?: string } | null = null;
      try {
        body = JSON.parse(rawText);
      } catch {
        // not JSON, handled below
      }
      if (!res.ok || !body?.steps?.length) {
        const detail = body?.error ?? rawText.slice(0, 400) ?? "(empty response)";
        setErrorMessage(`[HTTP ${res.status}] ${detail || "(empty response)"}`);
        setStatus("error");
        return;
      }
      setSteps(body.steps);
      setCurrentIndex(0);
      playStep(body.steps, 0);
    } catch (err) {
      setErrorMessage(`[network] ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  }

  function togglePause() {
    if (!audioRef.current) return;
    if (status === "playing") {
      audioRef.current.pause();
      setStatus("paused");
    } else if (status === "paused") {
      audioRef.current.play();
      setStatus("playing");
    }
  }

  function skip(direction: 1 | -1) {
    const next = currentIndex + direction;
    if (next < 0 || next >= steps.length) return;
    audioRef.current?.pause();
    setCurrentIndex(next);
    playStep(steps, next);
  }

  function exitTour() {
    audioRef.current?.pause();
    audioRef.current = null;
    setStatus("idle");
    setSteps([]);
    setCurrentIndex(0);
  }

  const active = status !== "idle";
  const currentStep = steps[currentIndex];
  const highlighting = status === "playing" || status === "paused";

  // Glow the whole content area while a step is actively narrating — a
  // reliable "spotlight" effect that works regardless of what page is
  // currently shown, since <main> persists across the client-side
  // navigation the tour drives (only its children swap).
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const glowClasses = ["ring-4", "ring-teal-400", "ring-inset", "transition-shadow", "duration-300"];
    if (highlighting) {
      main.classList.add(...glowClasses);
    } else {
      main.classList.remove(...glowClasses);
    }
    return () => {
      main.classList.remove(...glowClasses);
    };
  }, [highlighting]);

  return (
    <VoiceTourContext.Provider
      value={{ startTour, activeStepHref: highlighting ? (currentStep?.href ?? null) : null }}
    >
      {children}
      {active && (
        <div className="fixed inset-x-3 bottom-20 z-40 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px]">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
            {status === "loading" && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex-shrink-0 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                <p className="text-xs text-slate-600 dark:text-zinc-400">{t("voiceTour.preparing")}</p>
              </div>
            )}

            {status === "error" && (
              <div>
                <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
                <button
                  onClick={exitTour}
                  className="mt-2 text-[11px] font-semibold text-teal-600 hover:underline"
                >
                  {t("voiceTour.exit")}
                </button>
              </div>
            )}

            {status === "done" && (
              <div className="flex flex-col items-center gap-2 py-1 text-center">
                <div className="text-2xl">🎉</div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
                  {t("voiceTour.doneTitle")}
                </p>
                <button
                  onClick={exitTour}
                  className="mt-1 rounded-full bg-teal-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-500"
                >
                  {t("voiceTour.backHome")}
                </button>
              </div>
            )}

            {(status === "playing" || status === "paused") && currentStep && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-xl ${
                      status === "playing" ? "animate-pulse" : ""
                    }`}
                  >
                    {currentStep.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold tracking-wide text-teal-600 uppercase">
                      {t("voiceTour.step")} {currentIndex + 1} {t("voiceTour.of")} {steps.length}
                    </div>
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-zinc-50">
                      {currentStep.title}
                    </div>
                  </div>
                </div>
                <p className="max-h-20 overflow-y-auto text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400">
                  {currentStep.caption}
                </p>
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => skip(-1)}
                    disabled={currentIndex === 0}
                    className="rounded-full border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={togglePause}
                    className="flex-1 rounded-full bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-500"
                  >
                    {status === "playing" ? `⏸ ${t("voiceTour.pause")}` : `▶ ${t("voiceTour.resume")}`}
                  </button>
                  <button
                    onClick={() => skip(1)}
                    className="rounded-full border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    ⏭
                  </button>
                </div>
                <button
                  onClick={exitTour}
                  className="text-center text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  {t("voiceTour.exit")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </VoiceTourContext.Provider>
  );
}
