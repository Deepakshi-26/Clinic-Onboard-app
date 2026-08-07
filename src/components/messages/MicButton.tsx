"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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

export function MicButton({
  onTranscript,
  onRecordingComplete,
}: {
  onTranscript: (text: string) => void;
  onRecordingComplete: (file: File) => void;
}) {
  const { t, locale } = useLocale();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const ext = blob.type.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `voice-note-${Date.now()}.${ext}`, {
          type: blob.type,
        });
        onRecordingComplete(file);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      const RecognitionCtor = getSpeechRecognitionCtor();
      if (RecognitionCtor) {
        const recognition = new RecognitionCtor();
        recognition.lang = locale === "fr" ? "fr-CA" : "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          let finalText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) finalText += result[0].transcript;
          }
          if (finalText.trim()) onTranscript(finalText.trim());
        };
        recognition.onerror = () => {};
        recognition.onend = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }

      setRecording(true);
    } catch {
      setError(t("messages.micPermissionDenied"));
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        title={recording ? t("messages.stopRecording") : t("messages.startRecording")}
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-sm transition-colors ${
          recording
            ? "animate-pulse border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30"
            : "border-slate-300 text-slate-500 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-400"
        }`}
      >
        {recording ? "⏹️" : "🎤"}
      </button>
      {error && (
        <p className="absolute top-full left-0 z-10 mt-1 w-40 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
