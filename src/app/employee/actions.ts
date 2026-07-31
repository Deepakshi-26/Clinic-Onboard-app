"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function toggleGoal(goalId: string) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Forbidden");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) throw new Error("Employee record not found.");

  // Re-derive the goal's owner from the DB rather than trusting the client —
  // this ensures an employee can only toggle their own goals.
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, employeeId: employee.id },
  });
  if (!goal) throw new Error("Goal not found.");

  await prisma.goal.update({
    where: { id: goal.id },
    data: { done: !goal.done, doneAt: !goal.done ? new Date() : null },
  });

  revalidatePath("/employee");
  revalidatePath("/hr");
  revalidatePath("/hr/employees");
}
