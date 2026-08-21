import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";

function formatDateTime(date: Date, locale: "en" | "fr") {
  return new Date(date).toLocaleString(locale === "fr" ? "fr-CA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Every ASSISTANT reply that couldn't answer confidently is flagged
// `escalated` (see src/app/api/chat/route.ts's ESCALATE_MARKER handling).
// The preceding USER row is the question that triggered it — this view
// pairs them up so HR can see what the assistant couldn't cover, grouped by
// how often the same gap comes up.
export default async function ChatInsightsPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const escalations = await prisma.chatMessage.findMany({
    where: { role: "ASSISTANT", escalated: true },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true, name: true } } },
  });

  const questionByAssistantId = new Map<string, string>();
  if (escalations.length > 0) {
    const userIds = [...new Set(escalations.map((e) => e.userId))];
    const candidateQuestions = await prisma.chatMessage.findMany({
      where: { userId: { in: userIds }, role: "USER" },
      orderBy: { createdAt: "asc" },
    });
    // Match each escalated reply to the USER message immediately before it
    // in that user's own timeline.
    for (const escalation of escalations) {
      const priorQuestions = candidateQuestions.filter(
        (q) => q.userId === escalation.userId && q.createdAt <= escalation.createdAt
      );
      const question = priorQuestions[priorQuestions.length - 1];
      if (question) questionByAssistantId.set(escalation.id, question.content);
    }
  }

  const grouped = new Map<
    string,
    { count: number; lastAskedAt: Date; askedBy: Set<string> }
  >();
  for (const escalation of escalations) {
    const question = questionByAssistantId.get(escalation.id);
    if (!question) continue;
    const key = question.trim().toLowerCase();
    const entry = grouped.get(key) ?? { count: 0, lastAskedAt: escalation.createdAt, askedBy: new Set() };
    entry.count += 1;
    entry.askedBy.add(escalation.user.name || escalation.user.email);
    if (escalation.createdAt > entry.lastAskedAt) entry.lastAskedAt = escalation.createdAt;
    grouped.set(key, entry);
  }

  const rows = [...grouped.entries()]
    .map(([question, data]) => ({ question, ...data }))
    .sort((a, b) => b.count - a.count || b.lastAskedAt.getTime() - a.lastAskedAt.getTime());

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("chatInsights.title")}
      </h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400">{t("chatInsights.subtitle")}</p>

      <Card>
        {rows.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t("chatInsights.empty")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <div key={row.question} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
                    {row.question}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    {t("chatInsights.askedBy")} {[...row.askedBy].join(", ")} ·{" "}
                    {formatDateTime(row.lastAskedAt, locale)}
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  ×{row.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
