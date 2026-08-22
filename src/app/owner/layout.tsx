import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { AppShell } from "@/components/shell/AppShell";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OWNER") redirect("/hr");

  const t = getT(await getServerLocale());

  return (
    <AppShell
      role="OWNER"
      userLabel={session.user.name ?? session.user.email ?? t("shell.ownerFallback")}
      userSubLabel={t("shell.clinicOwner")}
    >
      {children}
    </AppShell>
  );
}
