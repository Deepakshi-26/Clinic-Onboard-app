import Link from "next/link";
import { prisma } from "@/lib/db";
import { getHrEmployeeThread } from "@/lib/repositories/messages";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { MessageBubbleList } from "@/components/messages/MessageBubbleList";
import { HrReplyForm } from "@/components/hr/HrReplyForm";

export default async function HrMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;

  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true, title: true, location: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const selected = employees.find((e) => e.id === selectedId);

  const thread = selectedId ? await getHrEmployeeThread(selectedId) : [];
  const bubbles = thread.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    alignRight: m.senderRole === "HR",
  }));

  const peerMessages = await prisma.message.findMany({
    where: { channel: "PEER" },
    orderBy: { createdAt: "desc" },
    include: {
      employee: { select: { fullName: true } },
      peerEmployee: { select: { fullName: true } },
    },
  });
  const peerThreads = new Map<
    string,
    { nameA: string; nameB: string; count: number; lastBody: string; lastAt: Date }
  >();
  for (const m of peerMessages) {
    const key = `${m.employeeId}::${m.peerEmployeeId}`;
    const existing = peerThreads.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      peerThreads.set(key, {
        nameA: m.employee.fullName,
        nameB: m.peerEmployee?.fullName ?? "Unknown",
        count: 1,
        lastBody: m.body,
        lastAt: m.createdAt,
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">Messages</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card title="📥 Conversations">
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {employees.map((e) => (
              <Link
                key={e.id}
                href={`/hr/messages?employeeId=${e.id}`}
                className={`flex items-center gap-2.5 py-2.5 ${
                  selectedId === e.id ? "opacity-100" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Avatar name={e.fullName} size={32} />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
                    {e.fullName}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card title={selected ? `💬 ${selected.fullName}` : "💬 Messages"}>
          {!selected ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No employees yet.
            </p>
          ) : (
            <>
              <MessageBubbleList messages={bubbles} />
              <HrReplyForm employeeId={selected.id} />
            </>
          )}
        </Card>
      </div>

      <Card title="🕵️ Peer Conversations — read-only oversight">
        <p className="mb-2.5 text-[11px] text-slate-500 dark:text-zinc-400">
          New hires who are onboarding at the same time can message each other
          directly. You can&apos;t reply here, but you can review if needed.
        </p>
        {peerThreads.size === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            No peer conversations yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 text-xs dark:divide-zinc-800">
            {Array.from(peerThreads.values()).map((t) => (
              <div key={`${t.nameA}-${t.nameB}`} className="py-2">
                <strong>
                  {t.nameA} ↔ {t.nameB}
                </strong>{" "}
                — {t.count} message{t.count > 1 ? "s" : ""}, last: &quot;
                {t.lastBody.slice(0, 60)}
                {t.lastBody.length > 60 ? "…" : ""}&quot;
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
