import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { IncidentLogForm } from "@/components/hr/IncidentLogForm";

function formatDate(date: Date, locale: "en" | "fr") {
  return new Date(date).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-US", {
    dateStyle: "medium",
  });
}

export default async function IncidentLogPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const incidents = await prisma.incidentLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("incidents.title")}
      </h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400">{t("incidents.subtitle")}</p>

      <Card title={`⚠️ ${t("incidents.guidanceTitle")}`}>
        <ol className="list-decimal space-y-1.5 pl-4 text-xs text-slate-600 dark:text-zinc-400">
          <li>{t("incidents.guidanceStep1")}</li>
          <li>{t("incidents.guidanceStep2")}</li>
          <li>{t("incidents.guidanceStep3")}</li>
          <li>{t("incidents.guidanceStep4")}</li>
          <li>{t("incidents.guidanceStep5")}</li>
        </ol>
      </Card>

      <Card title={`📋 ${t("incidents.newEntry")}`}>
        <IncidentLogForm />
      </Card>

      <Card title={`🗂️ ${t("incidents.history")}`}>
        {incidents.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t("incidents.empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>
                    {incident.occurredAt
                      ? formatDate(incident.occurredAt, locale)
                      : formatDate(incident.createdAt, locale)}
                  </span>
                  <span>{incident.reportedByEmail}</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-zinc-50">
                  {incident.whatHappened}
                </p>
                {incident.whoAffected && (
                  <p className="mt-1 text-slate-600 dark:text-zinc-400">
                    {t("incidents.whoAffected")}: {incident.whoAffected}
                  </p>
                )}
                {incident.actionsTaken && (
                  <p className="mt-1 text-slate-600 dark:text-zinc-400">
                    {t("incidents.actionsTaken")}: {incident.actionsTaken}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
