import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/shell/AppShell";

export default async function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "HR") redirect("/employee");

  return (
    <AppShell
      role="HR"
      userLabel={session.user.name ?? session.user.email ?? "HR"}
      userSubLabel="HR Director"
    >
      {children}
    </AppShell>
  );
}
