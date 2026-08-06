import { getServerLocale, getT } from "@/lib/i18n/server";

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

export async function CurrentAccessPanel({
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
  const t = getT(await getServerLocale());
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-bold text-slate-900 dark:text-zinc-50">
        👁 {t("access.currentAccess")} — {employeeName}
      </h3>
      <Row label={t("access.doorPasscode")} value={data?.doorPasscode ?? null} />
      <Row label={t("access.buildingPasscode")} value={data?.buildingPasscode ?? null} />
      <Row label={t("access.wifiPassword")} value={data?.wifiPassword ?? null} />
      <Row label={t("home.workEmail")} value={data?.workEmail ?? null} />
      <Row
        label={t("access.medexaPassword")}
        value={data?.medexaPassword ? "••••••••" : null}
      />
      <Row label={t("access.mylePassword")} value={data?.mylePassword ? "••••••••" : null} />
      <Row label={t("access.equipmentBox")} value={data?.equipmentBoxLocation ?? null} />
      <Row
        label={t("access.equipmentRequests")}
        value={data?.equipmentRequestEmail ?? null}
      />
      <Row label={t("access.trainer")} value={data?.trainerName ?? null} />
      <div className="mt-3 rounded-lg bg-slate-100 p-3 text-[11px] text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
        {t("access.perLocationNote")}
      </div>
    </div>
  );
}
