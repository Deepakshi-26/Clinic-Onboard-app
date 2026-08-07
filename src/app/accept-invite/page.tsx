import { prisma } from "@/lib/db";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = getT(await getServerLocale());

  const record = token
    ? await prisma.verificationToken.findUnique({ where: { token } })
    : null;
  const valid = !!record && record.expires > new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-teal-700 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl dark:bg-zinc-900">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 text-xl">
            🏥
          </div>
          <div className="font-serif text-2xl text-slate-900 dark:text-zinc-50">
            Clinic<span className="text-teal-600">Board</span>
          </div>
        </div>

        {valid && token ? (
          <>
            <p className="mb-7 pl-14 text-sm text-slate-500 dark:text-zinc-400">
              {t("acceptInvite.subtitle")}
            </p>
            <AcceptInviteForm token={token} />
          </>
        ) : (
          <p className="mt-6 text-sm text-red-600">{t("acceptInvite.invalidLink")}</p>
        )}
      </div>
    </div>
  );
}
