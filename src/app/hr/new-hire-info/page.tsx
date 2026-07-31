import { prisma } from "@/lib/db";
import { getEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { computeMissingDocs } from "@/lib/progress";
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
    </div>
  );
}
