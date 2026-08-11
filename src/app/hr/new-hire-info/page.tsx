import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { computeMissingDocs, formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { logAudit } from "@/lib/audit";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmployeeSelector } from "@/components/hr/EmployeeSelector";
import { NewHireInfoForm } from "@/components/hr/NewHireInfoForm";
import { ResendInviteButton } from "@/components/hr/ResendInviteButton";
import { DeactivateEmployeeButton } from "@/components/hr/DeactivateEmployeeButton";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function NewHireInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  const { employeeId } = await searchParams;
  const locale = await getServerLocale();
  const t = getT(locale);
  const session = await auth();

  const employees = await prisma.employee.findMany({
    where: { status: { not: "INACTIVE" } },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const info = selectedId ? await getEmployeeSensitiveInfo(selectedId) : null;

  if (info && session?.user) {
    await logAudit({
      actorUserId: session.user.id,
      actorEmail: session.user.email ?? "",
      action: "VIEW_SENSITIVE_INFO",
      targetEmployeeId: info.id,
    });
  }
  const missing = info ? computeMissingDocs(info) : [];
  const personalDocuments = selectedId
    ? await prisma.personalDocument.findMany({
        where: { employeeId: selectedId },
        orderBy: { uploadedAt: "desc" },
      })
    : [];
  const checkIns = selectedId
    ? await prisma.checkIn.findMany({
        where: { employeeId: selectedId },
        orderBy: { dayOffset: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("newHire.title")}
      </h2>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <EmployeeSelector
            employees={employees}
            selectedId={selectedId}
            basePath="/hr/new-hire-info"
          />
          {info && missing.length > 0 && (
            <StatusPill tone="red">
              {missing.length} {t("newHire.docsMissing")}
            </StatusPill>
          )}
          {info && missing.length === 0 && (
            <StatusPill tone="green">{t("newHire.allDocsComplete")}</StatusPill>
          )}
          {info && (
            <StatusPill tone={info.passwordSetAt ? "blue" : "amber"}>
              {info.passwordSetAt ? t("newHire.accountActive") : t("newHire.accountPending")}
            </StatusPill>
          )}
          {info && (
            <ResendInviteButton employeeId={info.id} accountActive={!!info.passwordSetAt} />
          )}
          {info && (
            <DeactivateEmployeeButton employeeId={info.id} employeeName={info.fullName} />
          )}
        </div>

        {!info ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("newHire.noEmployees")}
          </p>
        ) : (
          <NewHireInfoForm
            key={info.id}
            data={{
              employeeId: info.id,
              firstName: info.firstName,
              middleName: info.middleName ?? "",
              lastName: info.lastName,
              phone: info.phone ?? "",
              dateOfBirth: toDateInputValue(info.dateOfBirth),
              personalEmail: info.personalEmail,
              residentialAddress: info.residentialAddress ?? "",
              sinNumber: info.sinNumber ?? "",
              healthCardNumber: info.healthCardNumber ?? "",
              permitNumber: info.permitNumber ?? "",
              voidChequeUploaded: info.voidChequeUploaded,
              hrNotes: info.hrNotes ?? "",
            }}
          />
        )}
      </Card>

      {info && (
        <Card title={`📎 ${t("newHire.documentsSubmitted")}`}>
          {personalDocuments.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t("newHire.nothingUploadedByEmployee")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {personalDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="text-lg">📎</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
                      {doc.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {t("newHire.uploaded")} {formatShortDate(doc.uploadedAt, locale)}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {t("newHire.view")}
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {info && (
        <Card title={`📞 ${t("newHire.aiCheckIns")}`}>
          {checkIns.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t("newHire.noCheckInsYet")}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {checkIns.map((checkIn) => (
                <details
                  key={checkIn.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <summary className="cursor-pointer text-xs font-semibold text-slate-900 dark:text-zinc-50">
                    {t("newHire.day")} {checkIn.dayOffset} — {formatShortDate(checkIn.completedAt, locale)}
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
      )}
    </div>
  );
}
