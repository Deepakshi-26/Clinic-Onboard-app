import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { DocumentUploadForm } from "@/components/hr/DocumentUploadForm";
import { DocumentTile } from "@/components/hr/DocumentTile";

export default async function HrDocumentsPage() {
  const t = getT(await getServerLocale());

  const [employees, documents] = await Promise.all([
    prisma.employee.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.trainingDocument.findMany({
      include: { assignedEmployees: { select: { id: true, fullName: true } } },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("documents.heading")}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Card title={`📤 ${t("documents.uploadNew")}`}>
          <DocumentUploadForm employees={employees} />
        </Card>
        <Card title={`📚 ${t("documents.uploadedMaterials")}`}>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t("documents.noneUploaded")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <DocumentTile
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  docType={doc.docType}
                  roles={doc.roles}
                  assignedEmployees={doc.assignedEmployees}
                  allEmployees={employees}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
