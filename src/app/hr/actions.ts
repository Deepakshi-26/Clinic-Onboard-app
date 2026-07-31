"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function sendReminder(employeeId: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  });

  await prisma.emailLog.create({
    data: {
      kind: "REMINDER",
      toEmail: employee.personalEmail,
      subject: "Reminder: outstanding onboarding documents",
      body: `Hi ${employee.fullName}! Just a friendly reminder that you have outstanding documents to submit on your onboarding portal. Please log in and complete them before your deadline. Let us know if you need any help!`,
      employeeId: employee.id,
    },
  });

  console.log(`[stub email] Reminder sent to ${employee.personalEmail}`);

  revalidatePath("/hr");
  revalidatePath("/hr/employees");
}
