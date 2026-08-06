import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAccessCredential } from "@/lib/repositories/access";
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

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
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

  const { location } = await searchParams;
  const selectedLocation = (location as Location) ?? employee.location;
  const credential = await getAccessCredential(employee.id, selectedLocation);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        Access & Login Info
      </h2>

      <LocationTabs basePath="/employee/access" activeLocation={selectedLocation} />

      <Card
        title={`🔑 ${locationLabel(selectedLocation)} — Your Access`}
        className="max-w-md"
      >
        {!credential ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            No access details assigned for this location yet. Contact HR if needed.
          </p>
        ) : (
          <>
            <Row label="Work Email" value={credential.workEmail} />
            <Row label="Wi-Fi Password" value={credential.wifiPassword} />
            <Row label="Door Passcode" value={credential.doorPasscode} />
            <Row label="Building Passcode" value={credential.buildingPasscode} />
            <Row
              label="MEDEXA Password"
              value={credential.medexaPassword ? "••••••••" : null}
            />
            <Row label="Myle Password" value={credential.mylePassword ? "••••••••" : null} />
            <Row label="Equipment Box" value={credential.equipmentBoxLocation} />
            <Row label="Equipment Requests" value={credential.equipmentRequestEmail} />
            <Row label="Trainer" value={credential.trainerName} />
            {credential.parkingEnabled && (
              <Row label="🅿️ Parking" value={credential.parkingNote} />
            )}
            <div className="mt-3 rounded-lg bg-slate-100 p-3 text-[11px] text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
              🔒 This information is private to you. If anything is incorrect, contact
              HR.
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
