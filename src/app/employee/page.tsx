import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { locationLabel } from "@/lib/labels";
import { computeDaysRemaining, computeOverallProgress } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GoalCheck } from "@/components/employee/GoalCheck";

export default async function EmployeeHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = getT(locale);

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { goals: { orderBy: { order: "asc" } } },
  });

  if (!employee) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {t("common.noRecord")}
        </p>
      </Card>
    );
  }

  const overall = computeOverallProgress(employee, employee.goals);
  const daysRemaining = computeDaysRemaining(
    employee.startDate,
    employee.onboardingDurationDays
  );
  const firstName = employee.fullName.split(" ")[0];
  const dailyGoals = employee.goals.filter((g) => g.type === "DAILY");

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/employee/voice-tour"
        className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 px-5 py-4 text-white shadow-md transition-transform hover:scale-[1.01]"
      >
        <div>
          <div className="text-sm font-bold">{t("voiceTour.homeCardTitle")}</div>
          <div className="mt-0.5 text-xs text-white/85">{t("voiceTour.homeCardBody")}</div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-white/20 px-3.5 py-2 text-xs font-semibold whitespace-nowrap">
          {t("voiceTour.homeCardButton")} →
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title={`👋 ${t("home.welcomeGreeting")}, ${firstName}!`}>
          <p className="mb-3.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
            {employee.welcomeMessage ||
              `${t("home.welcomeMessagePrefix")} ${employee.onboardingDurationDays} ${t("home.welcomeMessageSuffix")}`}
          </p>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {t("home.overallProgress")}
            </span>
            <span className="text-sm font-bold text-teal-600">{overall}%</span>
          </div>
          <ProgressBar pct={overall} />
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            {t("home.daysRemaining")} <strong>{daysRemaining}</strong> {t("home.of")}{" "}
            {employee.onboardingDurationDays}
          </div>
        </Card>

        <Card title={`📌 ${t("home.quickInfo")}`}>
          <InfoRow
            label={t("home.yourTrainer")}
            value={employee.trainerName ?? t("home.notYetAssigned")}
          />
          <InfoRow
            label={t("home.workEmail")}
            value={employee.workEmail ?? t("home.notYetAssigned")}
          />
          <InfoRow label={t("employees.location")} value={locationLabel(employee.location, locale)} />
        </Card>
      </div>

      <Card title={`✅ ${t("home.todaysTasks")}`}>
        {dailyGoals.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("home.noTasksAssigned")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {dailyGoals.map((goal) => (
              <GoalCheck
                key={goal.id}
                goalId={goal.id}
                title={goal.title}
                description={goal.description}
                done={goal.done}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-2 text-xs last:border-0 dark:border-zinc-800">
      <span className="text-slate-500 dark:text-zinc-400">{label}</span>
      <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  );
}
