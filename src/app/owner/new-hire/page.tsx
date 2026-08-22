import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { titleLabel, locationLabel } from "@/lib/labels";
import { formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { AddNewHireForm } from "@/components/owner/AddNewHireForm";

export default async function OwnerPage() {
  const session = await auth();
  const locale = await getServerLocale();
  const t = getT(locale);

  const submissions = session?.user
    ? await prisma.pendingHire.findMany({
        where: { submittedById: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={`➕ ${t("owner.addHeading")}`}>
          <p className="mb-4 text-xs text-slate-500 dark:text-zinc-400">
            {t("owner.addSubtitle")}
          </p>
          <AddNewHireForm />
        </Card>

        <Card title={`📋 ${t("owner.historyHeading")}`}>
          {submissions.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t("owner.historyEmpty")}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
                      {s.fullName}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                      {titleLabel(s.title, locale)} · {locationLabel(s.location, locale)}
                      {s.proposedStartDate && (
                        <> · {t("owner.startDate")}: {formatShortDate(s.proposedStartDate, locale)}</>
                      )}
                    </div>
                  </div>
                  <StatusPill
                    tone={
                      s.status === "PENDING" ? "amber" : s.status === "CONVERTED" ? "green" : "red"
                    }
                  >
                    {t(`owner.status${s.status}`)}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
