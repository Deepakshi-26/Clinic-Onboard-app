"use client";

import { useRef, useState, useTransition } from "react";
import { sendMessageToHr } from "@/app/employee/messages/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MicButton } from "@/components/messages/MicButton";

export function HrReplyForm() {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function send() {
    if (!text.trim() && !file) return;
    const fd = new FormData();
    fd.set("body", text.trim());
    if (file) fd.set("file", file);
    startTransition(async () => {
      await sendMessageToHr(fd);
      setText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="mt-3">
      {file && (
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
          {file.type.startsWith("audio/") ? "🎤" : "📎"} {file.name}
          <button onClick={() => setFile(null)} className="text-red-500">
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title={t("messages.attachFile")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-500 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-400"
        >
          +
        </button>
        <MicButton
          onTranscript={(spoken) => setText((prev) => (prev ? `${prev} ${spoken}` : spoken))}
          onRecordingComplete={setFile}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("messages.typeYourMessage")}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          onClick={send}
          disabled={isPending || (!text.trim() && !file)}
          className="rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
        >
          {t("common.send")}
        </button>
      </div>
    </div>
  );
}
