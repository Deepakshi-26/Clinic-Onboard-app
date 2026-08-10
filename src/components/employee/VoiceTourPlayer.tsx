"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";

type TourStepData = {
  id: string;
  icon: string;
  title: string;
  caption: string;
  href: string;
  audioBase64: string;
};

type Status = "loading" | "ready" | "playing" | "paused" | "done" | "error";

export function VoiceTourPlayer() {
  const { t } = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [steps, setSteps] = useState<TourStepData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/voice-tour", { method: "POST" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.steps?.length) {
          throw new Error(body.error ?? "empty");
        }
        setSteps(body.steps);
        setStatus("ready");
      })
      .catch(() => {
        setErrorMessage(t("voiceTour.error"));
        setStatus("error");
      });

    return () => {
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function playStep(index: number) {
    audioRef.current?.pause();
    const step = steps[index];
    if (!step) {
      setStatus("done");
      return;
    }
    const audio = new Audio(`data:audio/mp3;base64,${step.audioBase64}`);
    audioRef.current = audio;
    audio.onended = () => {
      setTimeout(() => {
        setCurrentIndex((i) => {
          const next = i + 1;
          if (next < steps.length) {
            playStep(next);
          } else {
            setStatus("done");
          }
          return next;
        });
      }, 400);
    };
    audio.play();
    setStatus("playing");
  }

  function start() {
    setCurrentIndex(0);
    playStep(0);
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
    playStep(next);
  }

  function exit() {
    audioRef.current?.pause();
    router.push("/employee");
  }

  if (status === "loading") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">{t("voiceTour.preparing")}</p>
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        <Link
          href="/employee"
          className="mt-3 inline-block text-xs font-semibold text-teal-600 hover:underline"
        >
          {t("voiceTour.backHome")}
        </Link>
      </Card>
    );
  }

  if (status === "ready") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-4xl">
            🎙️
          </div>
          <p className="max-w-xs text-sm text-slate-600 dark:text-zinc-400">
            {t("voiceTour.readySubtitle")}
          </p>
          <button
            onClick={start}
            className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500"
          >
            {t("voiceTour.startButton")}
          </button>
        </div>
      </Card>
    );
  }

  if (status === "done") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <div className="text-3xl">🎉</div>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-zinc-50">
            {t("voiceTour.doneTitle")}
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">
            {t("voiceTour.doneSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {steps
            .filter((s) => s.id !== "welcome" && s.id !== "done")
            .map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <span className="text-lg">{s.icon}</span>
                {s.title}
              </Link>
            ))}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={start}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            {t("voiceTour.replay")}
          </button>
          <Link
            href="/employee"
            className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
          >
            {t("voiceTour.backHome")}
          </Link>
        </div>
      </Card>
    );
  }

  // playing or paused
  const step = steps[currentIndex];
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="mb-1 text-[11px] font-semibold tracking-wide text-teal-600 uppercase">
          {t("voiceTour.step")} {currentIndex + 1} {t("voiceTour.of")} {steps.length}
        </div>
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-5xl ${
            status === "playing" ? "animate-pulse" : ""
          }`}
        >
          {step.icon}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">{step.title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          {step.caption}
        </p>
        <Link
          href={step.href}
          className="text-xs font-semibold text-teal-600 hover:underline"
        >
          {t("voiceTour.takeMeThere")} →
        </Link>

        <div className="mt-3 flex items-center gap-2.5">
          <button
            onClick={() => skip(-1)}
            disabled={currentIndex === 0}
            className="rounded-full border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-600 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
          >
            ⏮ {t("voiceTour.previous")}
          </button>
          <button
            onClick={togglePause}
            className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
          >
            {status === "playing" ? `⏸ ${t("voiceTour.pause")}` : `▶ ${t("voiceTour.resume")}`}
          </button>
          <button
            onClick={() => skip(1)}
            className="rounded-full border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            {t("voiceTour.skip")} ⏭
          </button>
        </div>
        <button
          onClick={exit}
          className="mt-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
        >
          {t("voiceTour.exit")}
        </button>
      </div>
    </Card>
  );
}
