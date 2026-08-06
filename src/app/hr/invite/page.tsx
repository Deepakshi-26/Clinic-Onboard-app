import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { InviteForm } from "@/components/hr/InviteForm";

export default async function InvitePage() {
  const t = getT(await getServerLocale());
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("invite.heading")}
      </h2>
      <Card>
        <InviteForm />
      </Card>
    </div>
  );
}
