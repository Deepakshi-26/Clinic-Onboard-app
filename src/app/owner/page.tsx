import Link from "next/link";
import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import { computeOverallProgress, daysAgoDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function OwnerDashboardPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { goals: true },
    orderBy: { startDate: "desc" },
  });

  const pendingHiresCount = await prisma.pendingHire.count({
    where: { status: "PENDING" },
  });

  const completedLast30d = await prisma.employee.count({
    where: { status: "COMPLETED", completedAt: { gte: daysAgoDate(30) } },
  });

  const avgCompletion =
    employees.length === 0
      ? 0
      : Math.round(
          employees.reduce((sum, e) => sum + computeOverallProgress(e, e.goals), 0) /
            employees.length
        );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.activeOnboardings")}
          value={String(employees.length)}
          sub={`${employees.length} ${t("dashboard.inProgress")}`}
          tone="green"
        />
        <StatCard
          label={t("dashboard.avgCompletion")}
          value={`${avgCompletion}%`}
          sub={t("dashboard.acrossActive")}
          tone="amber"
        />
        <StatCard
          label={t("dashboard.newHireRequests")}
          value={String(pendingHiresCount)}
          sub={t("owner.awaitingHrReview")}
          tone={pendingHiresCount > 0 ? "amber" : "green"}
        />
        <StatCard
          label={t("dashboard.completed30d")}
          value={String(completedLast30d)}
          sub={t("dashboard.onTrack")}
          tone="green"
        />
      </div>

      <Card title={`📊 ${t("dashboard.employeeProgress")}`}>
        {employees.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("dashboard.noActiveOnboardings")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {employees.slice(0, 8).map((employee) => {
              const pct = computeOverallProgress(employee, employee.goals);
              return (
                <div key={employee.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={employee.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
                      {employee.fullName}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                      {titleLabel(employee.title, locale)} · {locationLabel(employee.location, locale)}
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0 text-right">
                    <div className="text-xs font-semibold text-teal-600">{pct}%</div>
                    <ProgressBar pct={pct} className="mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Link
        href="/owner/new-hire"
        className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs font-medium text-teal-600 hover:border-teal-500 dark:border-zinc-700"
      >
        ➕ {t("nav.addNewHire")} →
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "green" | "amber" | "red";
}) {
  const toneClass = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{label}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-zinc-50">{value}</div>
      <div className={`mt-0.5 text-[11px] ${toneClass}`}>{sub}</div>
    </div>
  );
}
