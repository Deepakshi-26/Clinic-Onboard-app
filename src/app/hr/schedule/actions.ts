"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const AddItemSchema = z.object({
  employeeId: z.string().min(1),
  date: z.coerce.date(),
  time: z.string().optional(),
  title: z.string().min(1),
  notes: z.string().optional(),
});

export async function addScheduleItem(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const parsed = AddItemSchema.parse(Object.fromEntries(formData));

  await prisma.scheduleItem.create({
    data: {
      employeeId: parsed.employeeId,
      date: parsed.date,
      time: parsed.time || null,
      title: parsed.title,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/hr/schedule");
  revalidatePath("/employee/schedule");
}

export async function removeScheduleItem(itemId: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  await prisma.scheduleItem.delete({ where: { id: itemId } });

  revalidatePath("/hr/schedule");
  revalidatePath("/employee/schedule");
}
