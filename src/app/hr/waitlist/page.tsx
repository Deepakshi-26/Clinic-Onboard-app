import { prisma } from "@/lib/db";
import { formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";

export default async function WaitlistPage() {
  const locale = await getServerLocale();
  const t = getT(locale);

  const signups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
          {t("nav.waitlist")}
        </h2>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          {signups.length} {t("waitlistAdmin.signups")}
        </span>
      </div>

      <Card>
        {signups.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("waitlistAdmin.empty")}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {signups.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-xs">
                <span className="font-mono text-slate-800 dark:text-zinc-200">{s.email}</span>
                <span className="text-slate-400 dark:text-zinc-500">
                  {formatShortDate(s.createdAt, locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
