import { getOrgSettings } from "@/lib/orgSettings";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { OrgSettingsForm } from "@/components/hr/OrgSettingsForm";

export default async function OrgSettingsPage() {
  const t = getT(await getServerLocale());
  const settings = await getOrgSettings();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("settings.title")}
      </h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400">{t("settings.subtitle")}</p>

      <Card>
        <OrgSettingsForm
          clinicName={settings.clinicName ?? ""}
          privacyOfficerName={settings.privacyOfficerName ?? ""}
          privacyOfficerEmail={settings.privacyOfficerEmail ?? ""}
        />
      </Card>
    </div>
  );
}
