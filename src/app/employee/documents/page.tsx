import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { formatShortDate } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { PersonalInfoForm } from "@/components/employee/PersonalInfoForm";
import { PersonalDocumentUploadForm } from "@/components/employee/PersonalDocumentUploadForm";
import { PersonalDocumentTile } from "@/components/employee/PersonalDocumentTile";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EmployeeDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { personalDocuments: { orderBy: { uploadedAt: "desc" } } },
  });
  if (!employee) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          No onboarding record found for your account yet. Contact HR.
        </p>
      </Card>
    );
  }

  const info = await getEmployeeSensitiveInfo(employee.id);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        My Documents
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Card title="📝 Your Personal Information">
          <PersonalInfoForm
            data={{
              fullName: info.fullName,
              phone: info.phone ?? "",
              dateOfBirth: toDateInputValue(info.dateOfBirth),
              residentialAddress: info.residentialAddress ?? "",
              sinNumber: info.sinNumber ?? "",
              healthCardNumber: info.healthCardNumber ?? "",
              permitNumber: info.permitNumber ?? "",
            }}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3 text-xs text-teal-800 dark:bg-teal-950/30 dark:text-teal-300">
            Also upload photos or scans of documents HR has asked for (e.g. a void
            cheque or work permit).
          </div>
          <Card title="📤 Upload a Document">
            <PersonalDocumentUploadForm />
          </Card>
          <Card title="📋 Your Uploads">
            {employee.personalDocuments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nothing uploaded yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {employee.personalDocuments.map((doc) => (
                  <PersonalDocumentTile
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    fileUrl={doc.fileUrl}
                    uploadedAt={formatShortDate(doc.uploadedAt)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
