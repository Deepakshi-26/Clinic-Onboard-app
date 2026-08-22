import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { InviteForm } from "@/components/hr/InviteForm";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ pendingHireId?: string }>;
}) {
  const t = getT(await getServerLocale());
  const { pendingHireId } = await searchParams;

  const pendingHire = pendingHireId
    ? await prisma.pendingHire.findUnique({ where: { id: pendingHireId } })
    : null;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("invite.heading")}
      </h2>
      {pendingHire && (
        <p className="text-xs text-teal-700 dark:text-teal-400">
          {t("invite.prefilledFromOwner")} <strong>{pendingHire.fullName}</strong>
        </p>
      )}
      <Card>
        <InviteForm
          defaults={
            pendingHire
              ? {
                  pendingHireId: pendingHire.id,
                  fullName: pendingHire.fullName,
                  title: pendingHire.title,
                  location: pendingHire.location,
                  personalEmail: pendingHire.personalEmail ?? "",
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
}
