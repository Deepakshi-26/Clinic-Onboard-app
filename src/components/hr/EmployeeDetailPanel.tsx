import type { Employee, Goal } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { StepBar } from "@/components/ui/StepBar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  computeDocumentItems,
  computeGoalsProgress,
  computeOnboardingSteps,
} from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";

export async function EmployeeDetailPanel({
  employee,
  goals,
}: {
  employee: Employee;
  goals: Goal[];
}) {
  const t = getT(await getServerLocale());
  const steps = computeOnboardingSteps(employee, goals);
  const documents = computeDocumentItems(employee);
  const daily = computeGoalsProgress(goals.filter((g) => g.type === "DAILY"));
  const weekly = computeGoalsProgress(goals.filter((g) => g.type === "WEEKLY"));
  const monthly = computeGoalsProgress(goals.filter((g) => g.type === "MONTHLY"));

  return (
    <Card title={`👤 ${employee.fullName} — ${t("employees.onboardingDetail")}`}>
      <StepBar steps={steps} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <SectionLabel>{t("steps.documents")}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {documents.map((doc) => (
              <div key={doc.labelKey} className="flex items-center gap-2 text-xs">
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] ${
                    doc.done
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-red-400"
                  }`}
                >
                  {doc.done && "✓"}
                </span>
                <span className={doc.done ? "" : "text-red-600"}>
                  {t(doc.labelKey)}
                  {!doc.done && " ⚠️"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>{t("employees.trainingProgress")}</SectionLabel>
          <div className="text-xs text-slate-600 dark:text-zinc-400">
            {employee.trainingProgressPct}% {t("common.complete")}
          </div>
          <ProgressBar pct={employee.trainingProgressPct} className="mt-1.5" />
        </div>

        <div>
          <SectionLabel>{t("employees.goals")}</SectionLabel>
          <GoalStat label={t("goals.daily")} stat={daily} />
          <GoalStat label={t("goals.weekly")} stat={weekly} />
          <GoalStat label={t("goals.monthly")} stat={monthly} />
        </div>
      </div>
    </Card>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
      {children}
    </div>
  );
}

function GoalStat({
  label,
  stat,
}: {
  label: string;
  stat: { done: number; total: number; pct: number };
}) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-zinc-400">{label}</span>
        <span className="text-slate-500 dark:text-zinc-400">
          {stat.done}/{stat.total}
        </span>
      </div>
      <ProgressBar
        pct={stat.pct}
        color={stat.pct === 100 ? "#2D9E6B" : stat.pct > 0 ? "#0D7377" : "#D1DDE6"}
      />
    </div>
  );
}
