import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { getDueCheckInDay, getNextIncompleteCheckInDay } from "@/lib/checkin";
import { Card } from "@/components/ui/Card";
import { CheckInConversation } from "@/components/employee/CheckInConversation";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { test } = await searchParams;
  const isTest = test === "1";
  const t = getT(await getServerLocale());

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

  const existingCheckIns = await prisma.checkIn.findMany({
    where: { employeeId: employee.id },
    select: { dayOffset: true },
  });
  const completedDayOffsets = existingCheckIns.map((c) => c.dayOffset);
  const dueDay =
    getDueCheckInDay(employee, completedDayOffsets) ??
    (isTest ? getNextIncompleteCheckInDay(employee, completedDayOffsets) : null);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("checkin.pageTitle")}
      </h2>
      {dueDay === null ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{t("checkin.noneDue")}</p>
        </Card>
      ) : (
        <CheckInConversation
          dayOffset={dueDay}
          firstName={employee.fullName.split(" ")[0]}
          isTest={isTest}
        />
      )}
    </div>
  );
}
