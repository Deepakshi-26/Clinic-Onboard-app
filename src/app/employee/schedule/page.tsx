import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatScheduleDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";

export default async function EmployeeSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = getT(locale);

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
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

  const items = await prisma.scheduleItem.findMany({
    where: { employeeId: employee.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("schedule.employeeHeading")}
      </h2>

      <Card>
        {items.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("schedule.employeeEmpty")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 py-2.5">
                <div className="w-24 flex-shrink-0 pt-0.5 text-[11px] font-semibold text-teal-600">
                  {formatScheduleDate(item.date, locale)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-900 dark:text-zinc-50">
                    {item.time && (
                      <span className="mr-1.5 text-slate-400 dark:text-zinc-500">
                        {item.time}
                      </span>
                    )}
                    {item.title}
                  </div>
                  {item.notes && (
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
