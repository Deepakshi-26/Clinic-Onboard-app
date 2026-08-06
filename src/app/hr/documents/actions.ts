"use server";

import { put, del } from "@vercel/blob";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { JobTitle } from "@prisma/client";

const UploadSchema = z.object({
  name: z.string().min(1),
  docType: z.string().min(1),
  roles: z.array(z.string()).default([]),
  assignedEmployeeId: z.string().optional(),
});

export type UploadActionState = { error: string } | null;

export async function uploadDocument(
  _prevState: UploadActionState,
  formData: FormData
): Promise<UploadActionState> {
  const session = await auth();
  if (session?.user?.role !== "HR") {
    return { error: "Forbidden" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: "File is too large — max 20MB." };
  }

  const result = UploadSchema.safeParse({
    name: formData.get("name"),
    docType: formData.get("docType"),
    roles: formData.getAll("roles"),
    assignedEmployeeId: formData.get("assignedEmployeeId") || undefined,
  });
  if (!result.success) {
    return { error: "Please fill in all required fields." };
  }
  const parsed = result.data;

  const blob = await put(`documents/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.trainingDocument.create({
    data: {
      name: parsed.name,
      docType: parsed.docType,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      roles: parsed.assignedEmployeeId ? [] : (parsed.roles as JobTitle[]),
      assignedEmployeeId: parsed.assignedEmployeeId || null,
    },
  });

  revalidatePath("/hr/documents");
  revalidatePath("/employee/training");
  return null;
}

export async function deleteDocument(id: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const doc = await prisma.trainingDocument.findUniqueOrThrow({ where: { id } });
  await del(doc.fileUrl);
  await prisma.trainingDocument.delete({ where: { id } });

  revalidatePath("/hr/documents");
  revalidatePath("/employee/training");
}
