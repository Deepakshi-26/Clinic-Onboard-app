import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAccessCredential } from "@/lib/repositories/access";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { LocationTabs } from "@/components/ui/LocationTabs";
import { locationLabel } from "@/lib/labels";
import type { Location } from "@prisma/client";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-2 text-xs last:border-0 dark:border-zinc-800">
      <span className="text-slate-500 dark:text-zinc-400">{label}</span>
      <span className="font-mono text-[11px] text-slate-800 dark:text-zinc-200">
        {value || "—"}
      </span>
    </div>
  );
}

export default async function EmployeeAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
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

  const { location } = await searchParams;
  const selectedLocation = (location as Location) ?? employee.location;
  const credential = await getAccessCredential(employee.id, selectedLocation);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("access.loginInfo")}
      </h2>

      <LocationTabs basePath="/employee/access" activeLocation={selectedLocation} />

      <Card
        title={`🔑 ${locationLabel(selectedLocation, locale)} — ${t("access.yourAccess")}`}
        className="max-w-md"
      >
        {!credential ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("access.noAccessAssigned")}
          </p>
        ) : (
          <>
            <Row label={t("home.workEmail")} value={credential.workEmail} />
            <Row label={t("access.wifiPassword")} value={credential.wifiPassword} />
            <Row label={t("access.doorPasscode")} value={credential.doorPasscode} />
            <Row label={t("access.buildingPasscode")} value={credential.buildingPasscode} />
            <Row label={t("access.medexaUsername")} value={credential.medexaUsername} />
            <Row
              label={t("access.medexaPassword")}
              value={credential.medexaPassword ? "••••••••" : null}
            />
            {credential.medexaLink && (
              <div className="flex items-center justify-between border-b border-slate-50 py-2 text-xs last:border-0 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t("access.medexaLink")}</span>
                <a
                  href={credential.medexaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 hover:text-teal-700"
                >
                  {t("access.openLink")}
                </a>
              </div>
            )}
            <Row label={t("access.myleUsername")} value={credential.myleUsername} />
            <Row
              label={t("access.mylePassword")}
              value={credential.mylePassword ? "••••••••" : null}
            />
            {credential.myleLink && (
              <div className="flex items-center justify-between border-b border-slate-50 py-2 text-xs last:border-0 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t("access.myleLink")}</span>
                <a
                  href={credential.myleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 hover:text-teal-700"
                >
                  {t("access.openLink")}
                </a>
              </div>
            )}
            <Row label={t("access.equipmentBox")} value={credential.equipmentBoxLocation} />
            <Row
              label={t("access.equipmentRequests")}
              value={credential.equipmentRequestEmail}
            />
            <Row label={t("access.trainer")} value={credential.trainerName} />
            {credential.parkingEnabled && (
              <Row label={`🅿️ ${t("access.parking")}`} value={credential.parkingNote} />
            )}
            <div className="mt-3 rounded-lg bg-slate-100 p-3 text-[11px] text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
              🔒 {t("access.privateNote")}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
