import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { titleLabel } from "@/lib/labels";
import { AppShell } from "@/components/shell/AppShell";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "EMPLOYEE") redirect("/hr");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <AppShell
      role="EMPLOYEE"
      userLabel={employee?.fullName ?? session.user.email ?? "Employee"}
      userSubLabel={employee ? titleLabel(employee.title) : ""}
    >
      {children}
    </AppShell>
  );
}
