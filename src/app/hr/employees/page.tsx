import Link from "next/link";
import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import {
  computeDeadline,
  computeGoalsProgress,
  computeMissingDocs,
  computeOverallProgress,
  computePhaseLabel,
  formatShortDate,
} from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmployeeDetailPanel } from "@/components/hr/EmployeeDetailPanel";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;

  const employees = await prisma.employee.findMany({
    include: { goals: true },
    orderBy: { startDate: "desc" },
  });

  const selected = employeeId
    ? employees.find((e) => e.id === employeeId)
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
          All Employees
        </h2>
        <Link
          href="/hr/invite"
          className="rounded-md bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500"
        >
          + Invite New Hire
        </Link>
      </div>

      <Card>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                <Th>Name</Th>
                <Th>Title</Th>
                <Th>Location</Th>
                <Th>Start Date</Th>
                <Th>Phase</Th>
                <Th>Overall</Th>
                <Th>Documents</Th>
                <Th>Training</Th>
                <Th>Goals</Th>
                <Th>Deadline</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const overall = computeOverallProgress(employee, employee.goals);
                const missing = computeMissingDocs(employee);
                const goalsStat = computeGoalsProgress(employee.goals);
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
                    <Td>{formatShortDate(employee.startDate)}</Td>
                    <Td>
                      <StatusPill tone="blue">
                        {computePhaseLabel(employee.startDate)}
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
                        <StatusPill tone="green">All Done</StatusPill>
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
                      <StatusPill tone={missing.length > 0 ? "red" : "blue"}>
                        {formatShortDate(deadline)}
                      </StatusPill>
                    </Td>
                    <Td>
                      <Link
                        href={
                          selected?.id === employee.id
                            ? "/hr/employees"
                            : `/hr/employees?employeeId=${employee.id}`
                        }
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                      >
                        {selected?.id === employee.id ? "Hide" : "Detail"}
                      </Link>
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
