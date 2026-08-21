"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MermaidDiagram } from "@/components/chatbot/MermaidDiagram";
import { sendMessageToHr } from "@/app/employee/messages/actions";

type Escalate = { draftQuestion: string; opsLeadName: string; opsLeadEmail: string | null };
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  escalate?: Escalate | null;
};

type ContentPart = { type: "text"; text: string } | { type: "mermaid"; chart: string };

function parseMessageContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();
    if (before) parts.push({ type: "text", text: before });
    parts.push({ type: "mermaid", chart: match[1].trim() });
    lastIndex = regex.lastIndex;
  }
  const rest = content.slice(lastIndex).trim();
  if (rest) parts.push({ type: "text", text: rest });
  return parts;
}

function renderBoldSegments(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((segment, i) =>
    segment.startsWith("**") && segment.endsWith("**") ? (
      <strong key={i}>{segment.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{segment}</Fragment>
    )
  );
}

export function Chatbot({ role }: { role: "HR" | "EMPLOYEE" }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [escalateSentAt, setEscalateSentAt] = useState<Set<number>>(new Set());
  const hasFetchedHistory = useRef(false);

  useEffect(() => {
    if (!open || hasFetchedHistory.current) return;
    hasFetchedHistory.current = true;

    fetch("/api/chat")
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((body: { messages?: ChatMessage[] }) => {
        setMessages(
          body.messages && body.messages.length > 0
            ? body.messages
            : [{ role: "assistant", content: t("chatbot.greeting") }]
        );
      })
      .catch(() => {
        setMessages([{ role: "assistant", content: t("chatbot.greeting") }]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const body = await res.json();
      const reply: string = res.ok
        ? body.reply
        : (body.error ?? t("chatbot.error"));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          sources: res.ok ? body.sources : undefined,
          escalate: res.ok ? body.escalate : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chatbot.connectionError") },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title={t("chatbot.title")}
        data-tour="chatbot-button"
        className="fixed right-4 bottom-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-xl text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        style={{ height: 52, width: 52 }}
      >
        💬
      </button>

      {open && (
        <div className="fixed right-3 bottom-20 left-3 z-40 flex h-[min(490px,70vh)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:bottom-24 sm:left-auto sm:w-[350px] dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm">
              🤖
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">ClinicBoard AI</div>
              <div className="text-[10px] text-white/45">
                {role === "HR" ? t("chatbot.fullAccess") : t("chatbot.scopedAccess")}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto rounded-br-sm bg-teal-600 text-white"
                    : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50"
                }`}
              >
                {parseMessageContent(m.content).map((part, j) =>
                  part.type === "mermaid" ? (
                    <MermaidDiagram key={j} chart={part.chart} />
                  ) : (
                    <div key={j} className="whitespace-pre-wrap">
                      {renderBoldSegments(part.text)}
                    </div>
                  )
                )}

                {!!m.sources?.length && (
                  <div className="mt-1.5 border-t border-slate-200 pt-1.5 text-[10px] text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                    {t("chatbot.sourcesLabel")} {m.sources.join(", ")}
                  </div>
                )}

                {m.escalate && role === "EMPLOYEE" && (
                  <div className="mt-2 border-t border-slate-200 pt-2 dark:border-zinc-700">
                    {escalateSentAt.has(i) ? (
                      <span className="text-[11px] text-emerald-600">
                        ✓ {t("chatbot.escalateSent")} {m.escalate.opsLeadName}
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          const formData = new FormData();
                          formData.set("body", m.escalate!.draftQuestion);
                          await sendMessageToHr(formData);
                          setEscalateSentAt((prev) => new Set(prev).add(i));
                        }}
                        className="rounded-full bg-teal-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-teal-500"
                      >
                        {t("chatbot.askPrefix")} {m.escalate.opsLeadName}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="w-fit rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-xs text-slate-400 dark:bg-zinc-800">
                {t("chatbot.typing")}
              </div>
            )}
          </div>

          <div className="flex gap-1.5 border-t border-slate-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chatbot.placeholder")}
              className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              onClick={send}
              disabled={sending}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-white disabled:opacity-60"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
