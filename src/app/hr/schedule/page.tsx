import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { EmployeeSelector } from "@/components/hr/EmployeeSelector";
import { SchedulePanel } from "@/components/hr/SchedulePanel";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;
  const t = getT(await getServerLocale());

  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const items = selectedId
    ? await prisma.scheduleItem.findMany({
        where: { employeeId: selectedId },
        orderBy: { date: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("nav.schedule")}
      </h2>

      <div className="max-w-xs">
        <EmployeeSelector
          employees={employees}
          selectedId={selectedId}
          basePath="/hr/schedule"
        />
      </div>

      {!selectedId ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("access.noEmployees")}
          </p>
        </Card>
      ) : (
        <Card>
          <SchedulePanel key={selectedId} employeeId={selectedId} items={items} />
        </Card>
      )}
    </div>
  );
}
