import Link from "next/link";
import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import {
  computeDaysElapsed,
  computeDeadline,
  computeGoalsProgress,
  computeMissingDocs,
  computeOverallProgress,
  computeWeekNumber,
  formatShortDate,
} from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmployeeDetailPanel } from "@/components/hr/EmployeeDetailPanel";
import { SendReminderButton } from "@/components/hr/SendReminderButton";
import { getServerLocale, getT } from "@/lib/i18n/server";

function isOverdue(startDate: Date, durationDays: number): boolean {
  return computeDaysElapsed(startDate) > durationDays / 2;
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; emailStatus?: string }>;
}) {
  const { employeeId, emailStatus } = await searchParams;
  const locale = await getServerLocale();
  const t = getT(locale);

  const employees = await prisma.employee.findMany({
    where: { status: { not: "INACTIVE" } },
    include: { goals: true },
    orderBy: { startDate: "desc" },
  });

  const selected = employeeId
    ? employees.find((e) => e.id === employeeId)
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("employees.allEmployees")}
      </h2>

      {emailStatus === "sent" && (
        <p className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✅ {t("invite.emailSent")}
        </p>
      )}
      {emailStatus === "failed" && (
        <p className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠️ {t("invite.emailFailed")}
        </p>
      )}

      <Card>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                <Th>{t("employees.name")}</Th>
                <Th>{t("employees.email")}</Th>
                <Th>{t("employees.title")}</Th>
                <Th>{t("employees.location")}</Th>
                <Th>{t("employees.startDate")}</Th>
                <Th>{t("employees.phase")}</Th>
                <Th>{t("employees.overall")}</Th>
                <Th>{t("steps.documents")}</Th>
                <Th>{t("employees.training")}</Th>
                <Th>{t("employees.goals")}</Th>
                <Th>{t("employees.deadline")}</Th>
                <Th>{t("employees.action")}</Th>
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
                    <Td>{employee.personalEmail}</Td>
                    <Td>{titleLabel(employee.title, locale)}</Td>
                    <Td>{locationLabel(employee.location, locale)}</Td>
                    <Td>{formatShortDate(employee.startDate, locale)}</Td>
                    <Td>
                      <StatusPill tone="blue">
                        {t("common.week")} {computeWeekNumber(employee.startDate)}
                      </StatusPill>
                    </Td>
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
                        <StatusPill tone="green">{t("employees.allDone")}</StatusPill>
                      ) : (
                        <StatusPill tone={missing.length > 1 ? "red" : "amber"}>
                          {missing.length} {t("employees.missing")}
                        </StatusPill>
                      )}
                    </Td>
                    <Td>{employee.trainingProgressPct}%</Td>
                    <Td>
                      {goalsStat.done}/{goalsStat.total}
                    </Td>
                    <Td>
                      <StatusPill tone={missing.length > 0 ? "red" : "blue"}>
                        {formatShortDate(deadline, locale)}
                      </StatusPill>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={
                            selected?.id === employee.id
                              ? "/hr/employees"
                              : `/hr/employees?employeeId=${employee.id}`
                          }
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {selected?.id === employee.id
                            ? t("employees.hide")
                            : t("employees.detail")}
                        </Link>
                        {missing.length > 0 && (
                          <SendReminderButton
                            employeeId={employee.id}
                            employeeName={employee.fullName}
                            overdue={overdue}
                          />
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <EmployeeDetailPanel employee={selected} goals={selected.goals} />
      )}
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
