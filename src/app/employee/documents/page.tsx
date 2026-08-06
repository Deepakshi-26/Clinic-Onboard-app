import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
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

  const locale = await getServerLocale();
  const t = getT(locale);

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { personalDocuments: { orderBy: { uploadedAt: "desc" } } },
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

  const info = await getEmployeeSensitiveInfo(employee.id);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("docs.myDocumentsHeading")}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Card title={`📝 ${t("docs.yourPersonalInfo")}`}>
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
            {t("docs.uploadHint")}
          </div>
          <Card title={`📤 ${t("docs.uploadDocument")}`}>
            <PersonalDocumentUploadForm />
          </Card>
          <Card title={`📋 ${t("docs.yourUploads")}`}>
            {employee.personalDocuments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("docs.nothingUploaded")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {employee.personalDocuments.map((doc) => (
                  <PersonalDocumentTile
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    fileUrl={doc.fileUrl}
                    uploadedAt={formatShortDate(doc.uploadedAt, locale)}
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
