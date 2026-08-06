export type BubbleMessage = {
  id: string;
  body: string;
  createdAt: Date;
  alignRight: boolean;
};

export function MessageBubbleList({ messages }: { messages: BubbleMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        No messages yet — say hello!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto rounded-lg border border-slate-100 p-3 dark:border-zinc-800" style={{ maxHeight: 260 }}>
      {messages.map((m) => (
        <div
          key={m.id}
          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
            m.alignRight
              ? "ml-auto rounded-br-sm bg-teal-600 text-white"
              : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50"
          }`}
        >
          <div>{m.body}</div>
          <div
            className={`mt-1 text-[9px] ${
              m.alignRight ? "text-teal-100" : "text-slate-400 dark:text-zinc-500"
            }`}
          >
            {m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </div>
  );
}
