import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

function formatDateTime(date: Date, locale: "en" | "fr") {
  return new Date(date).toLocaleString(locale === "fr" ? "fr-CA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AuditLogPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { targetEmployee: { select: { fullName: true } } },
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("auditLog.title")}
      </h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400">{t("auditLog.subtitle")}</p>

      <Card>
        {entries.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t("auditLog.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-3 font-semibold">{t("auditLog.when")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("auditLog.who")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("auditLog.action")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("auditLog.employee")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-500 dark:text-zinc-400">
                      {formatDateTime(entry.createdAt, locale)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-700 dark:text-zinc-300">
                      {entry.actorEmail}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <StatusPill tone={entry.action === "EDIT_SENSITIVE_INFO" ? "amber" : "blue"}>
                        {entry.action === "EDIT_SENSITIVE_INFO"
                          ? t("auditLog.actionEdit")
                          : t("auditLog.actionView")}
                      </StatusPill>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-700 dark:text-zinc-300">
                      {entry.targetEmployee?.fullName ?? t("auditLog.unknownEmployee")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
