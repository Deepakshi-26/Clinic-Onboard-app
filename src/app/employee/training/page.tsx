import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";

export default async function EmployeeTrainingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = getT(await getServerLocale());

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

  const documents = await prisma.trainingDocument.findMany({
    where: {
      OR: [
        { assignedEmployees: { some: { id: employee.id } } },
        { roles: { has: employee.title } },
      ],
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("training.heading")}
      </h2>
      <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
        ✅ {t("training.hint")}
      </div>

      {documents.length === 0 ? (
        <Card>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t("training.noneAssigned")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-2xl">📄</span>
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
                {doc.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                {doc.docType}
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 rounded-md bg-teal-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-teal-500"
              >
                {t("training.open")}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
