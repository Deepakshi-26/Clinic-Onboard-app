import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmployeeSelector } from "@/components/hr/EmployeeSelector";
import { GoalsSetupPanel } from "@/components/hr/GoalsSetupPanel";

export default async function GoalsSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;

  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const goals = selectedId
    ? await prisma.goal.findMany({
        where: { employeeId: selectedId },
        orderBy: { order: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        Goals Setup
      </h2>

      <div className="max-w-xs">
        <EmployeeSelector
          employees={employees}
          selectedId={selectedId}
          basePath="/hr/goals"
        />
      </div>

      {!selectedId ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            No employees yet — invite a new hire first.
          </p>
        </Card>
      ) : (
        <Card>
          <GoalsSetupPanel key={selectedId} employeeId={selectedId} goals={goals} />
        </Card>
      )}
    </div>
  );
}
