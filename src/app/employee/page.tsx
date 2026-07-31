import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { locationLabel } from "@/lib/labels";
import { computeDaysRemaining, computeOverallProgress } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GoalCheck } from "@/components/employee/GoalCheck";

export default async function EmployeeHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { goals: { orderBy: { order: "asc" } } },
  });

  if (!employee) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          No onboarding record found for your account yet. Contact HR.
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
      <div className="grid grid-cols-2 gap-4">
        <Card title={`👋 Welcome, ${firstName}!`}>
          <p className="mb-3.5 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
            {employee.welcomeMessage ||
              `We're excited to have you join the clinic team. Your onboarding period is ${employee.onboardingDurationDays} days. Complete your goals and use the chatbot if you have questions.`}
          </p>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-teal-600">{overall}%</span>
          </div>
          <ProgressBar pct={overall} />
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Days remaining: <strong>{daysRemaining}</strong> of{" "}
            {employee.onboardingDurationDays}
          </div>
        </Card>

        <Card title="📌 Quick Info">
          <InfoRow label="Your Trainer" value={employee.trainerName ?? "Not yet assigned"} />
          <InfoRow label="Work Email" value={employee.workEmail ?? "Not yet assigned"} />
          <InfoRow label="Location" value={locationLabel(employee.location)} />
        </Card>
      </div>

      <Card title="✅ Today's Tasks">
        {dailyGoals.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            No tasks assigned yet.
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
