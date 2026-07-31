"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function Chatbot({ role }: { role: "HR" | "EMPLOYEE" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your onboarding assistant. What do you need help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const body = await res.json();
      const reply: string = res.ok
        ? body.reply
        : body.error ?? "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Connection issue. Please check your internet and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Ask the AI Assistant"
        className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-xl text-white shadow-lg transition-transform hover:scale-105"
        style={{ height: 52, width: 52 }}
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[490px] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm">
              🤖
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">ClinicBoard AI</div>
              <div className="text-[10px] text-white/45">
                {role === "HR" ? "Full portal access" : "Role-scoped answers"}
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
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="w-fit rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-xs text-slate-400 dark:bg-zinc-800">
                Typing…
              </div>
            )}
          </div>

          <div className="flex gap-1.5 border-t border-slate-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your portal or goals…"
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
