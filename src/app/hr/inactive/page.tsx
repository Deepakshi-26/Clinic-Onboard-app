import Link from "next/link";
import { prisma } from "@/lib/db";
import { locationLabel, titleLabel } from "@/lib/labels";
import { formatScheduleDate, formatShortDate } from "@/lib/progress";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { EmployeeDetailPanel } from "@/components/hr/EmployeeDetailPanel";
import { ReactivateEmployeeButton } from "@/components/hr/ReactivateEmployeeButton";
import { EmployeeSearchBox } from "@/components/hr/EmployeeSearchBox";

export default async function InactiveEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; q?: string }>;
}) {
  const { employeeId, q } = await searchParams;
  const locale = await getServerLocale();
  const t = getT(locale);

  const employees = await prisma.employee.findMany({
    where: {
      status: "INACTIVE",
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { personalEmail: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { goals: true },
    orderBy: { inactiveAt: "desc" },
  });

  const selected = employeeId ? employees.find((e) => e.id === employeeId) : undefined;

  const [scheduleItems, trainingDocs] = selected
    ? await Promise.all([
        prisma.scheduleItem.findMany({
          where: { employeeId: selected.id },
          orderBy: { date: "asc" },
        }),
        prisma.trainingDocument.findMany({
          where: {
            OR: [
              { assignedEmployees: { some: { id: selected.id } } },
              { roles: { has: selected.title } },
            ],
          },
          orderBy: { uploadedAt: "desc" },
        }),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("nav.inactive")}
      </h2>

      <EmployeeSearchBox basePath="/hr/inactive" />

      <Card>
        {employees.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {q ? t("common.noSearchResults") : t("inactive.empty")}
          </p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  <Th>{t("employees.name")}</Th>
                  <Th>{t("employees.email")}</Th>
                  <Th>{t("employees.title")}</Th>
                  <Th>{t("employees.location")}</Th>
                  <Th>{t("inactive.since")}</Th>
                  <Th>{t("employees.action")}</Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-800/40"
                  >
                    <Td>
                      <strong>{employee.fullName}</strong>
                    </Td>
                    <Td>{employee.personalEmail}</Td>
                    <Td>{titleLabel(employee.title, locale)}</Td>
                    <Td>{locationLabel(employee.location, locale)}</Td>
                    <Td>
                      {employee.inactiveAt ? formatShortDate(employee.inactiveAt, locale) : "—"}
                    </Td>
                    <Td>
                      <Link
                        href={
                          selected?.id === employee.id
                            ? "/hr/inactive"
                            : `/hr/inactive?employeeId=${employee.id}`
                        }
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                      >
                        {selected?.id === employee.id
                          ? t("employees.hide")
                          : t("inactive.viewHistory")}
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("inactive.since")}{" "}
                {selected.inactiveAt ? formatShortDate(selected.inactiveAt, locale) : "—"}
              </p>
              <ReactivateEmployeeButton employeeId={selected.id} />
            </div>
          </Card>

          <EmployeeDetailPanel employee={selected} goals={selected.goals} />

          <Card title={`📚 ${t("documents.uploadedMaterials")}`}>
            {trainingDocs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("documents.noneUploaded")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {trainingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <span className="text-lg">📄</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-zinc-50">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {doc.docType}
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {t("newHire.view")}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`🗓️ ${t("nav.schedule")}`}>
            {scheduleItems.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t("schedule.empty")}
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 py-2.5">
                    <div className="w-24 flex-shrink-0 pt-0.5 text-[11px] font-semibold text-teal-600">
                      {formatScheduleDate(item.date, locale)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-900 dark:text-zinc-50">
                        {item.time && (
                          <span className="mr-1.5 text-slate-400 dark:text-zinc-500">
                            {item.time}
                          </span>
                        )}
                        {item.title}
                      </div>
                      {item.notes && (
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-2.5 text-slate-700 dark:text-zinc-300">{children}</td>
  );
}
