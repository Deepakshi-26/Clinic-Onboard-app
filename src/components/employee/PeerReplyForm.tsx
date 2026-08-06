"use client";

import { useState, useTransition } from "react";
import { sendPeerMessage } from "@/app/employee/messages/actions";

export function PeerReplyForm({ peerEmployeeId }: { peerEmployeeId: string }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function send() {
    if (!text.trim()) return;
    const fd = new FormData();
    fd.set("peerEmployeeId", peerEmployeeId);
    fd.set("body", text.trim());
    startTransition(async () => {
      await sendPeerMessage(fd);
      setText("");
    });
  }

  return (
    <div className="mt-3 flex gap-1.5">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Message your peer…"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        onClick={send}
        disabled={isPending || !text.trim()}
        className="rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
      >
        Send
      </button>
    </div>
  );
}
