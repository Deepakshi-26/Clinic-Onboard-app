import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { VoiceTourPlayer } from "@/components/employee/VoiceTourPlayer";

export default async function VoiceTourPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = getT(await getServerLocale());

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("voiceTour.pageTitle")}
      </h2>
      <VoiceTourPlayer />
    </div>
  );
}
