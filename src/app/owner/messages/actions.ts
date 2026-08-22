"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadMessageAttachment } from "@/lib/message-attachments";

const BodySchema = z.object({ body: z.string().optional() });

export async function sendMessageToHr(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Forbidden");

  const parsed = BodySchema.parse({ body: formData.get("body") || undefined });

  const file = formData.get("file");
  const attachment =
    file instanceof File && file.size > 0 ? await uploadMessageAttachment(file) : null;

  if (!parsed.body?.trim() && !attachment) {
    throw new Error("Message must have text or an attachment.");
  }

  await prisma.ownerMessage.create({
    data: {
      ownerId: session.user.id,
      senderRole: "OWNER",
      body: parsed.body?.trim() ?? "",
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
    },
  });

  revalidatePath("/owner/messages");
  revalidatePath("/hr/messages");
}
