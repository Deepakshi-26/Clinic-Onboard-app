import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { getCurrentCheckInDay } from "@/lib/checkin";
import { Card } from "@/components/ui/Card";
import { CheckInConversation } from "@/components/employee/CheckInConversation";

export default async function CheckInPage() {
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
        <p className="text-sm text-slate-500 dark:text-zinc-400">{t("common.noRecord")}</p>
      </Card>
    );
  }

  const pastCheckIns = await prisma.checkIn.findMany({
    where: { employeeId: employee.id },
    orderBy: { dayOffset: "desc" },
  });
  const todayDay = getCurrentCheckInDay(employee);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("checkin.pageTitle")}
      </h2>

      {todayDay !== null ? (
        <CheckInConversation
          key={todayDay}
          dayOffset={todayDay}
          firstName={employee.fullName.split(" ")[0]}
        />
      ) : (
        <Card>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{t("checkin.allCaughtUp")}</p>
        </Card>
      )}

      <Card title={`📞 ${t("checkin.historyTitle")}`}>
        {pastCheckIns.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("checkin.noHistoryYet")}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {pastCheckIns.map((checkIn) => (
              <details
                key={checkIn.id}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <summary className="cursor-pointer text-xs font-semibold text-slate-900 dark:text-zinc-50">
                  {t("checkin.dayLabel")} {checkIn.dayOffset} — {formatShortDate(checkIn.completedAt, locale)}
                </summary>
                {checkIn.summary && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                    {checkIn.summary}
                  </p>
                )}
                <pre className="mt-2 max-h-48 overflow-y-auto rounded-md bg-slate-50 p-2.5 text-[11px] whitespace-pre-wrap text-slate-500 dark:bg-zinc-950 dark:text-zinc-400">
                  {checkIn.transcript}
                </pre>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
