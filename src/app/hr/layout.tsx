import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { AppShell } from "@/components/shell/AppShell";

export default async function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "HR") redirect("/employee");

  const t = getT(await getServerLocale());

  return (
    <AppShell
      role="HR"
      userLabel={session.user.name ?? session.user.email ?? t("shell.hrFallback")}
      userSubLabel={t("shell.hrDirector")}
    >
      {children}
    </AppShell>
  );
}
