import { getServerLocale, getT } from "@/lib/i18n/server";
import { NetworkBackground } from "@/components/auth/NetworkBackground";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export default async function WaitlistPage() {
  const t = getT(await getServerLocale());

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-teal-800 px-4">
      <NetworkBackground />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl dark:bg-zinc-900">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 text-xl">
            🏥
          </div>
          <div className="font-serif text-2xl text-slate-900 dark:text-zinc-50">
            Clinic<span className="text-teal-600">Board</span>
          </div>
        </div>
        <p className="mb-7 pl-14 text-sm text-slate-500 dark:text-zinc-400">
          {t("waitlist.tagline")}
        </p>

        <h1 className="mb-2 text-lg font-bold text-slate-900 dark:text-zinc-50">
          {t("waitlist.heading")}
        </h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-zinc-400">
          {t("waitlist.subheading")}
        </p>

        <WaitlistForm />
      </div>
    </div>
  );
}
