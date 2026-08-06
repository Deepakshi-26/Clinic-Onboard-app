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

export function CurrentAccessPanel({
  employeeName,
  data,
}: {
  employeeName: string;
  data: {
    doorPasscode: string | null;
    buildingPasscode: string | null;
    wifiPassword: string | null;
    workEmail: string | null;
    medexaPassword: string | null;
    mylePassword: string | null;
    equipmentBoxLocation: string | null;
    equipmentRequestEmail: string | null;
    trainerName: string | null;
  } | null;
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-bold text-slate-900 dark:text-zinc-50">
        👁 Current Access — {employeeName}
      </h3>
      <Row label="Door Passcode" value={data?.doorPasscode ?? null} />
      <Row label="Building Passcode" value={data?.buildingPasscode ?? null} />
      <Row label="Wi-Fi Password" value={data?.wifiPassword ?? null} />
      <Row label="Work Email" value={data?.workEmail ?? null} />
      <Row label="MEDEXA Password" value={data?.medexaPassword ? "••••••••" : null} />
      <Row label="Myle Password" value={data?.mylePassword ? "••••••••" : null} />
      <Row label="Equipment Box" value={data?.equipmentBoxLocation ?? null} />
      <Row label="Equipment Requests" value={data?.equipmentRequestEmail ?? null} />
      <Row label="Trainer" value={data?.trainerName ?? null} />
      <div className="mt-3 rounded-lg bg-slate-100 p-3 text-[11px] text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
        Each employee can have different credentials per location. Only HR can view
        and edit these.
      </div>
    </div>
  );
}
