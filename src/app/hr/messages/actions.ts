"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadMessageAttachment } from "@/lib/message-attachments";

const SendSchema = z.object({
  employeeId: z.string().min(1),
  body: z.string().optional(),
});

export async function sendHrMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const parsed = SendSchema.parse({
    employeeId: formData.get("employeeId"),
    body: formData.get("body") || undefined,
  });

  const file = formData.get("file");
  const attachment =
    file instanceof File && file.size > 0 ? await uploadMessageAttachment(file) : null;

  if (!parsed.body?.trim() && !attachment) {
    throw new Error("Message must have text or an attachment.");
  }

  await prisma.message.create({
    data: {
      channel: "HR_EMPLOYEE",
      employeeId: parsed.employeeId,
      senderRole: "HR",
      body: parsed.body?.trim() ?? "",
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
    },
  });

  revalidatePath("/hr/messages");
  revalidatePath("/employee/messages");
}

const SendOwnerSchema = z.object({
  ownerId: z.string().min(1),
  body: z.string().optional(),
});

export async function sendOwnerMessage(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const parsed = SendOwnerSchema.parse({
    ownerId: formData.get("ownerId"),
    body: formData.get("body") || undefined,
  });

  const file = formData.get("file");
  const attachment =
    file instanceof File && file.size > 0 ? await uploadMessageAttachment(file) : null;

  if (!parsed.body?.trim() && !attachment) {
    throw new Error("Message must have text or an attachment.");
  }

  await prisma.ownerMessage.create({
    data: {
      ownerId: parsed.ownerId,
      senderRole: "HR",
      body: parsed.body?.trim() ?? "",
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
    },
  });

  revalidatePath("/hr/messages");
  revalidatePath("/owner/messages");
}
