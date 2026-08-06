import { prisma } from "@/lib/db";
import { getEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { computeMissingDocs, formatShortDate } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmployeeSelector } from "@/components/hr/EmployeeSelector";
import { NewHireInfoForm } from "@/components/hr/NewHireInfoForm";

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

  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const info = selectedId ? await getEmployeeSensitiveInfo(selectedId) : null;
  const missing = info ? computeMissingDocs(info) : [];
  const personalDocuments = selectedId
    ? await prisma.personalDocument.findMany({
        where: { employeeId: selectedId },
        orderBy: { uploadedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        New Hire Personal Information
      </h2>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <EmployeeSelector
            employees={employees}
            selectedId={selectedId}
            basePath="/hr/new-hire-info"
          />
          {info && missing.length > 0 && (
            <StatusPill tone="red">{missing.length} Docs Missing</StatusPill>
          )}
          {info && missing.length === 0 && <StatusPill tone="green">All Docs Complete</StatusPill>}
        </div>

        {!info ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            No employees yet — invite a new hire first.
          </p>
        ) : (
          <NewHireInfoForm
            key={info.id}
            data={{
              employeeId: info.id,
              fullName: info.fullName,
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
        <Card title="📎 Documents Submitted by Employee">
          {personalDocuments.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nothing uploaded yet — the employee can add documents (like a void
              cheque or permit photo) from their own portal.
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
                      Uploaded {formatShortDate(doc.uploadedAt)}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
