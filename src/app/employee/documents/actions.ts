"use server";

import { put, del } from "@vercel/blob";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateEmployeeSensitiveInfo } from "@/lib/repositories/employee";

const UploadSchema = z.object({
  label: z.string().min(1),
});

export type UploadActionState = { error: string } | null;

export async function uploadPersonalDocument(
  _prevState: UploadActionState,
  formData: FormData
): Promise<UploadActionState> {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") {
    return { error: "Forbidden" };
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return { error: "No onboarding record found for your account." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: "File is too large — max 20MB." };
  }

  const result = UploadSchema.safeParse({ label: formData.get("label") });
  if (!result.success) {
    return { error: "Please describe what this document is." };
  }

  const blob = await put(`personal-documents/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.personalDocument.create({
    data: {
      employeeId: employee.id,
      label: result.data.label,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
    },
  });

  revalidatePath("/employee/documents");
  revalidatePath("/hr/new-hire-info");
  return null;
}

const PersonalInfoSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  residentialAddress: z.string().optional(),
  sinNumber: z.string().optional(),
  healthCardNumber: z.string().optional(),
  permitNumber: z.string().optional(),
});

export async function updateOwnPersonalInfo(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Forbidden");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) throw new Error("No onboarding record found for your account.");

  const parsed = PersonalInfoSchema.parse(Object.fromEntries(formData));

  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      fullName: parsed.fullName,
      phone: parsed.phone || null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      residentialAddress: parsed.residentialAddress || null,
    },
  });

  await updateEmployeeSensitiveInfo(employee.id, {
    sinNumber: parsed.sinNumber,
    healthCardNumber: parsed.healthCardNumber,
    permitNumber: parsed.permitNumber,
  });

  revalidatePath("/employee/documents");
  revalidatePath("/hr/new-hire-info");
  revalidatePath("/hr/employees");
}

export async function deletePersonalDocument(id: string) {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Forbidden");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) throw new Error("No onboarding record found for your account.");

  // Re-derive ownership from the DB rather than trusting the client — an
  // employee can only delete their own uploads.
  const doc = await prisma.personalDocument.findFirst({
    where: { id, employeeId: employee.id },
  });
  if (!doc) throw new Error("Document not found.");

  await del(doc.fileUrl);
  await prisma.personalDocument.delete({ where: { id: doc.id } });

  revalidatePath("/employee/documents");
  revalidatePath("/hr/new-hire-info");
}
