"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Turn = { role: "user" | "assistant"; content: string };
type Status = "idle" | "thinking" | "speaking" | "listening" | "done" | "error";

export function CheckInConversation({
  dayOffset,
  firstName,
  isTest = false,
}: {
  dayOffset: number;
  firstName: string;
  isTest?: boolean;
}) {
  const { t, locale } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [lastReply, setLastReply] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const pendingTurnsRef = useRef<Turn[]>([]);

  async function postTurn(turnsSoFar: Turn[], forceEnd = false) {
    setStatus("thinking");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: turnsSoFar, forceEnd, test: isTest }),
      });
      const rawText = await res.text();
      let body: { reply?: string; audioBase64?: string; done?: boolean; error?: string } | null = null;
      try {
        body = JSON.parse(rawText);
      } catch {
        // not JSON, handled below
      }

      if (!res.ok || !body?.audioBase64) {
        const detail = body?.error ?? rawText.slice(0, 400) ?? "(empty response)";
        setErrorMessage(`[HTTP ${res.status}] ${detail || "(empty response)"}`);
        setStatus("error");
        return;
      }

      const newTurns: Turn[] = [...turnsSoFar, { role: "assistant", content: body.reply ?? "" }];
      setTurns(newTurns);
      setLastReply(body.reply ?? "");

      const audio = new Audio(`data:audio/mp3;base64,${body.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        if (body?.done) {
          setStatus("done");
        } else {
          startListening(newTurns);
        }
      };
      audio.play();
      setStatus("speaking");
    } catch (err) {
      setErrorMessage(`[network] ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  }

  async function startListening(turnsSoFar: Turn[]) {
    finalTranscriptRef.current = "";
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMessage(t("checkin.micDenied"));
      setStatus("error");
      return;
    }

    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      setErrorMessage(t("checkin.noSpeechSupport"));
      setStatus("error");
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = locale === "fr" ? "fr-CA" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) text += result[0].transcript;
      }
      if (text.trim()) finalTranscriptRef.current += (finalTranscriptRef.current ? " " : "") + text.trim();
    };
    recognition.onerror = () => {};
    recognition.onend = () => {};
    recognition.start();
    recognitionRef.current = recognition;
    setStatus("listening");

    // stash for finishTurn to read turnsSoFar
    pendingTurnsRef.current = turnsSoFar;
  }

  function finishTurn() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    const spoken = finalTranscriptRef.current.trim();
    if (!spoken) {
      // nothing captured — let them try again
      startListening(pendingTurnsRef.current);
      return;
    }
    const newTurns: Turn[] = [...pendingTurnsRef.current, { role: "user", content: spoken }];
    postTurn(newTurns);
  }

  function endCheckIn() {
    audioRef.current?.pause();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    postTurn(turns, true);
  }

  if (status === "idle") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-4xl">
            📞
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
            {t("checkin.dayLabel")} {dayOffset} {t("checkin.checkinWord")}
          </h3>
          <p className="max-w-xs text-sm text-slate-600 dark:text-zinc-400">
            {t("checkin.greeting")}, {firstName}! {t("checkin.readySubtitle")}
          </p>
          <button
            onClick={() => postTurn([])}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {t("checkin.startButton")}
          </button>
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        <Link href="/employee" className="mt-3 inline-block text-xs font-semibold text-teal-600 hover:underline">
          {t("checkin.backHome")}
        </Link>
      </Card>
    );
  }

  if (status === "done") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="text-3xl">✅</div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">
            {t("checkin.doneTitle")}
          </h3>
          <p className="max-w-sm text-sm text-slate-600 dark:text-zinc-400">{lastReply}</p>
          <Link
            href="/employee"
            className="mt-3 rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
          >
            {t("checkin.backHome")}
          </Link>
        </div>
      </Card>
    );
  }

  // thinking / speaking / listening
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-5xl ${
            status === "speaking" ? "animate-pulse" : ""
          } ${status === "listening" ? "ring-4 ring-red-400" : ""}`}
        >
          {status === "listening" ? "🎤" : "📞"}
        </div>

        <div className="text-xs font-semibold text-orange-600">
          {status === "thinking" && t("checkin.statusThinking")}
          {status === "speaking" && t("checkin.statusSpeaking")}
          {status === "listening" && t("checkin.statusListening")}
        </div>

        {lastReply && status !== "listening" && (
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            {lastReply}
          </p>
        )}

        {status === "listening" && (
          <button
            onClick={finishTurn}
            className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
          >
            ✅ {t("checkin.doneSpeaking")}
          </button>
        )}

        <button
          onClick={endCheckIn}
          className="mt-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
        >
          {t("checkin.endCall")}
        </button>
      </div>
    </Card>
  );
}
