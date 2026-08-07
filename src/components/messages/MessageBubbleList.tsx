"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/translations";

export type BubbleMessage = {
  id: string;
  body: string;
  createdAt: Date;
  alignRight: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  read?: boolean;
};

const AUDIO_EXTENSIONS = [".webm", ".ogg", ".m4a", ".mp3", ".wav", ".mp4"];

function isAudioAttachment(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayDivider(
  date: Date,
  locale: Locale,
  t: (key: string) => string
): string {
  const now = new Date();
  if (isSameDay(date, now)) return t("messages.today");

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return t("messages.yesterday");

  return date.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MessageBubbleList({ messages }: { messages: BubbleMessage[] }) {
  const { t, locale } = useLocale();
  if (messages.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        {t("messages.noMessagesYet")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto rounded-lg border border-slate-100 p-3 dark:border-zinc-800" style={{ maxHeight: 260 }}>
      {messages.map((m, i) => {
        const showDivider = i === 0 || !isSameDay(m.createdAt, messages[i - 1].createdAt);
        return (
          <div key={m.id} className="flex flex-col gap-2.5">
            {showDivider && (
              <div className="mx-auto rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                {formatDayDivider(m.createdAt, locale, t)}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                m.alignRight
                  ? "ml-auto rounded-br-sm bg-teal-600 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50"
              }`}
            >
              {m.body && <div>{m.body}</div>}
              {m.attachmentUrl &&
                (isAudioAttachment(m.attachmentName) ? (
                  <audio
                    controls
                    src={m.attachmentUrl}
                    className="mt-1.5 h-8 w-full max-w-56"
                    style={{ filter: m.alignRight ? "invert(1)" : undefined }}
                  />
                ) : (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium underline-offset-2 hover:underline ${
                      m.alignRight
                        ? "bg-white/15 text-white"
                        : "bg-white text-teal-700 dark:bg-zinc-900 dark:text-teal-400"
                    }`}
                  >
                    📎 {m.attachmentName ?? "Attachment"}
                  </a>
                ))}
              <div
                className={`mt-1 flex items-center gap-1 text-[9px] ${
                  m.alignRight ? "text-teal-100" : "text-slate-400 dark:text-zinc-500"
                }`}
              >
                <span>
                  {m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {m.alignRight && (
                  <span title={m.read ? t("messages.read") : t("messages.sentStatus")}>
                    {m.read ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
