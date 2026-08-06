"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const SendSchema = z.object({
  employeeId: z.string().min(1),
  body: z.string().min(1),
});

export async function sendHrMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const parsed = SendSchema.parse(Object.fromEntries(formData));

  await prisma.message.create({
    data: {
      channel: "HR_EMPLOYEE",
      employeeId: parsed.employeeId,
      senderRole: "HR",
      body: parsed.body,
    },
  });

  revalidatePath("/hr/messages");
  revalidatePath("/employee/messages");
}
