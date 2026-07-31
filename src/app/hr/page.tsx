import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import {
  computeDaysElapsed,
  computeDeadline,
  computeMissingDocs,
  computeOverallProgress,
  daysAgoDate,
  formatShortDate,
} from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SendReminderButton } from "@/components/hr/SendReminderButton";

// Missing docs are treated as "overdue" once the employee is past the
// halfway point of their onboarding window — a simple, explainable heuristic
// since there's no per-document deadline model yet.
function isOverdue(startDate: Date, durationDays: number): boolean {
  return computeDaysElapsed(startDate) > durationDays / 2;
}

export default async function HrDashboardPage() {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { goals: true },
    orderBy: { startDate: "desc" },
  });

  const completedLast30d = await prisma.employee.count({
    where: {
      status: "COMPLETED",
      completedAt: { gte: daysAgoDate(30) },
    },
  });

  const withMissingDocs = employees
    .map((employee) => ({
      employee,
      missing: computeMissingDocs(employee),
      overdue: isOverdue(employee.startDate, employee.onboardingDurationDays),
    }))
    .filter((e) => e.missing.length > 0)
    .sort((a, b) => Number(b.overdue) - Number(a.overdue));

  const totalMissingDocs = withMissingDocs.reduce(
    (sum, e) => sum + e.missing.length,
    0
  );
  const overdueMissingDocs = withMissingDocs
    .filter((e) => e.overdue)
    .reduce((sum, e) => sum + e.missing.length, 0);

  const avgCompletion =
    employees.length === 0
      ? 0
      : Math.round(
          employees.reduce(
            (sum, e) => sum + computeOverallProgress(e, e.goals),
            0
          ) / employees.length
        );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-3.5">
        <StatCard
          label="Active Onboardings"
          value={String(employees.length)}
          sub={`${employees.length} in progress`}
          tone="green"
        />
        <StatCard
          label="Docs Pending"
          value={String(totalMissingDocs)}
          sub={overdueMissingDocs > 0 ? `⚠ ${overdueMissingDocs} overdue` : "None overdue"}
          tone={overdueMissingDocs > 0 ? "red" : "green"}
        />
        <StatCard
          label="Avg. Completion"
          value={`${avgCompletion}%`}
          sub="Across active onboardings"
          tone="amber"
        />
        <StatCard
          label="Completed (30d)"
          value={String(completedLast30d)}
          sub="On track"
          tone="green"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="🚨 Urgent — Action Required">
          {withMissingDocs.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nothing urgent — no missing documents right now.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {withMissingDocs.slice(0, 3).map(({ employee, missing, overdue }) => (
                <div
                  key={employee.id}
                  className={`rounded-lg border-l-4 p-3 text-xs ${
                    overdue
                      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                  }`}
                >
                  <strong>{employee.fullName}</strong> — {missing[0].label.toLowerCase()}{" "}
                  missing.{" "}
                  <strong>
                    Deadline:{" "}
                    {formatShortDate(
                      computeDeadline(employee.startDate, employee.onboardingDurationDays)
                    )}
                  </strong>
                  <div className="mt-2 flex gap-1.5">
                    <SendReminderButton
                      employeeId={employee.id}
                      employeeName={employee.fullName}
                      overdue={overdue}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="📊 Employee Progress">
          {employees.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No active onboardings yet — invite a new hire to get started.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
              {employees.slice(0, 5).map((employee) => {
                const pct = computeOverallProgress(employee, employee.goals);
                return (
                  <div key={employee.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={employee.fullName} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
                        {employee.fullName}
                      </div>
                      <div className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                        {titleLabel(employee.title)} · {locationLabel(employee.location)}
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
      </div>
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
      <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-zinc-50">{value}</div>
      <div className={`mt-0.5 text-[11px] ${toneClass}`}>{sub}</div>
    </div>
  );
}
