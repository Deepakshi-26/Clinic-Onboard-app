import { prisma } from "@/lib/db";
import { getAccessCredential } from "@/lib/repositories/access";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { LocationTabs } from "@/components/ui/LocationTabs";
import { EmployeeSelector } from "@/components/hr/EmployeeSelector";
import { AccessCredentialForm } from "@/components/hr/AccessCredentialForm";
import { CurrentAccessPanel } from "@/components/hr/CurrentAccessPanel";
import type { Location } from "@prisma/client";

const DEFAULT_LOCATION: Location = "PARC_EXTENSION";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; location?: string }>;
}) {
  const { employeeId, location } = await searchParams;
  const t = getT(await getServerLocale());

  const employees = await prisma.employee.findMany({
    where: { status: { not: "INACTIVE" } },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  const selectedId = employeeId ?? employees[0]?.id;
  const selectedLocation = (location as Location) ?? DEFAULT_LOCATION;
  const selectedEmployee = employees.find((e) => e.id === selectedId);

  const credential = selectedId
    ? await getAccessCredential(selectedId, selectedLocation)
    : null;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("access.heading")}
      </h2>

      <div className="max-w-xs">
        <EmployeeSelector
          employees={employees}
          selectedId={selectedId}
          basePath="/hr/access"
        />
      </div>

      {!selectedEmployee ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("access.noEmployees")}
          </p>
        </Card>
      ) : (
        <>
          <LocationTabs
            basePath="/hr/access"
            activeLocation={selectedLocation}
            extraParams={{ employeeId: selectedId }}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title={`🔐 ${t("access.editDetails")}`}>
              <AccessCredentialForm
                key={`${selectedId}-${selectedLocation}`}
                data={{
                  employeeId: selectedId!,
                  location: selectedLocation,
                  workEmail: credential?.workEmail ?? "",
                  doorPasscode: credential?.doorPasscode ?? "",
                  buildingPasscode: credential?.buildingPasscode ?? "",
                  wifiPassword: credential?.wifiPassword ?? "",
                  medexaPassword: credential?.medexaPassword ?? "",
                  mylePassword: credential?.mylePassword ?? "",
                  equipmentBoxLocation: credential?.equipmentBoxLocation ?? "",
                  equipmentRequestEmail: credential?.equipmentRequestEmail ?? "",
                  trainerName: credential?.trainerName ?? "",
                  parkingEnabled: credential?.parkingEnabled ?? false,
                  parkingNote: credential?.parkingNote ?? "",
                }}
              />
            </Card>
            <Card>
              <CurrentAccessPanel
                employeeName={selectedEmployee.fullName}
                data={credential}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
