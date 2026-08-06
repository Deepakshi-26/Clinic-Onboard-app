"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const AddGoalSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  title: z.string().min(1),
  periodNumber: z.coerce.number().int().positive(),
});

export async function addGoal(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const parsed = AddGoalSchema.parse(Object.fromEntries(formData));

  const maxOrder = await prisma.goal.aggregate({
    where: { employeeId: parsed.employeeId },
    _max: { order: true },
  });

  await prisma.goal.create({
    data: {
      employeeId: parsed.employeeId,
      type: parsed.type,
      title: parsed.title,
      periodNumber: parsed.periodNumber,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidatePath("/hr/goals");
  revalidatePath("/employee");
  revalidatePath("/hr/employees");
}

export async function removeGoal(goalId: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  await prisma.goal.delete({ where: { id: goalId } });

  revalidatePath("/hr/goals");
  revalidatePath("/employee");
  revalidatePath("/hr/employees");
}
