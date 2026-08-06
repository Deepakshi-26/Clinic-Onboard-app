import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import {
  computeDaysElapsed,
  computeDeadline,
  computeGoalsProgress,
  computeMissingDocs,
  computeOverallProgress,
  formatShortDate,
} from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { SendReminderButton } from "@/components/hr/SendReminderButton";

function isOverdue(startDate: Date, durationDays: number): boolean {
  return computeDaysElapsed(startDate) > durationDays / 2;
}

export default async function ProgressTrackerPage() {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { goals: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        Progress Tracker
      </h2>

      <Card>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                <Th>Employee</Th>
                <Th>Title</Th>
                <Th>Location</Th>
                <Th>Overall</Th>
                <Th>Documents</Th>
                <Th>Training</Th>
                <Th>Goals</Th>
                <Th>Deadline</Th>
                <Th>Reminder</Th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const overall = computeOverallProgress(employee, employee.goals);
                const missing = computeMissingDocs(employee);
                const goalsStat = computeGoalsProgress(employee.goals);
                const overdue = isOverdue(
                  employee.startDate,
                  employee.onboardingDurationDays
                );
                const deadline = computeDeadline(
                  employee.startDate,
                  employee.onboardingDurationDays
                );

                return (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-800/40"
                  >
                    <Td>
                      <strong>{employee.fullName}</strong>
                    </Td>
                    <Td>{titleLabel(employee.title)}</Td>
                    <Td>{locationLabel(employee.location)}</Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <ProgressBar
                          pct={overall}
                          className="w-16"
                          color={
                            overall >= 75 ? "#2D9E6B" : overall >= 45 ? "#E89A2B" : "#D94040"
                          }
                        />
                        <span>{overall}%</span>
                      </div>
                    </Td>
                    <Td>
                      {missing.length === 0 ? (
                        <StatusPill tone="green">Complete</StatusPill>
                      ) : (
                        <StatusPill tone={missing.length > 1 ? "red" : "amber"}>
                          {missing.length} Missing
                        </StatusPill>
                      )}
                    </Td>
                    <Td>{employee.trainingProgressPct}%</Td>
                    <Td>
                      {goalsStat.done}/{goalsStat.total}
                    </Td>
                    <Td>
                      <StatusPill tone={overdue ? "red" : "blue"}>
                        {formatShortDate(deadline)}
                      </StatusPill>
                    </Td>
                    <Td>
                      <SendReminderButton
                        employeeId={employee.id}
                        employeeName={employee.fullName}
                        overdue={overdue}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-2.5 text-slate-700 dark:text-zinc-300">{children}</td>
  );
}
