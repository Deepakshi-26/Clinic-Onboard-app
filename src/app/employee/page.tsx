import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { locationLabel } from "@/lib/labels";
import { computeDaysRemaining, computeOverallProgress } from "@/lib/progress";
import { getCurrentCheckInDay } from "@/lib/checkin";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GoalCheck } from "@/components/employee/GoalCheck";
import { VoiceTourStartCard } from "@/components/employee/VoiceTourStartCard";

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
  const weeklyGoals = employee.goals.filter((g) => g.type === "WEEKLY");
  const monthlyGoals = employee.goals.filter((g) => g.type === "MONTHLY");

  const todayCheckInDay = getCurrentCheckInDay(employee);

  return (
    <div className="flex flex-col gap-5">
      <VoiceTourStartCard />

      <Link
        href="/employee/check-in"
        data-tour="checkin-banner"
        className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 px-5 py-4 text-white shadow-md transition-transform hover:scale-[1.01]"
      >
        {todayCheckInDay !== null ? (
          <>
            <div>
              <div className="text-sm font-bold">
                {t("checkin.homeCardTitle")} {todayCheckInDay}
              </div>
              <div className="mt-0.5 text-xs text-white/85">{t("checkin.homeCardBody")}</div>
            </div>
            <span className="flex-shrink-0 rounded-full bg-white/20 px-3.5 py-2 text-xs font-semibold whitespace-nowrap">
              {t("checkin.homeCardButton")} →
            </span>
          </>
        ) : (
          <>
            <div>
              <div className="text-sm font-bold">{t("checkin.checkinWord")}</div>
              <div className="mt-0.5 text-xs text-white/85">{t("checkin.allCaughtUp")}</div>
            </div>
            <span className="flex-shrink-0 rounded-full bg-white/20 px-3.5 py-2 text-xs font-semibold whitespace-nowrap">
              {t("checkin.historyTitle")} →
            </span>
          </>
        )}
      </Link>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card tourId="home-welcome" title={`👋 ${t("home.welcomeGreeting")}, ${firstName}!`}>
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

        <Card tourId="home-quickinfo" title={`📌 ${t("home.quickInfo")}`}>
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

      <Card tourId="home-tasks" title={`✅ ${t("home.todaysTasks")}`}>
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

      <Card tourId="home-weekly" title={`🗓️ ${t("home.weeklyTasks")}`}>
        {weeklyGoals.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("home.noTasksAssigned")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {weeklyGoals.map((goal) => (
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

      <Card tourId="home-monthly" title={`📆 ${t("home.monthlyTasks")}`}>
        {monthlyGoals.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("home.noTasksAssigned")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {monthlyGoals.map((goal) => (
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
