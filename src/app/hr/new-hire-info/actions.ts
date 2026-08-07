"use server";

import { z } from "zod";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateEmployeeSensitiveInfo } from "@/lib/repositories/employee";
import { buildInviteEmailHtml, getBaseUrl, sendEmail } from "@/lib/email";

const UpdateSchema = z.object({
  employeeId: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  personalEmail: z.string().email(),
  residentialAddress: z.string().optional(),
  sinNumber: z.string().optional(),
  healthCardNumber: z.string().optional(),
  permitNumber: z.string().optional(),
  voidChequeUploaded: z.coerce.boolean().optional(),
  hrNotes: z.string().optional(),
});

export type UpdateEmployeeState = { error: string } | null;

export async function updateEmployeeInfo(
  _prevState: UpdateEmployeeState,
  formData: FormData
): Promise<UpdateEmployeeState> {
  const session = await auth();
  if (session?.user?.role !== "HR") return { error: "forbidden" };

  const raw = Object.fromEntries(formData);
  const parsed = UpdateSchema.parse({
    ...raw,
    voidChequeUploaded: raw.voidChequeUploaded === "on",
  });

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: parsed.employeeId },
  });

  // personalEmail doubles as the login (User.email) — if HR is correcting a
  // typo'd or duplicate address, keep the two in sync rather than letting
  // them drift apart.
  if (parsed.personalEmail !== employee.personalEmail) {
    const conflict = await prisma.user.findUnique({
      where: { email: parsed.personalEmail },
    });
    if (conflict && conflict.id !== employee.userId) {
      return { error: "emailInUse" };
    }
    await prisma.user.update({
      where: { id: employee.userId },
      data: { email: parsed.personalEmail },
    });
    // Any outstanding set-password link was issued for the old address.
    await prisma.verificationToken.deleteMany({
      where: { identifier: employee.personalEmail },
    });
  }

  await prisma.employee.update({
    where: { id: parsed.employeeId },
    data: {
      fullName: parsed.fullName,
      phone: parsed.phone || null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      personalEmail: parsed.personalEmail,
      residentialAddress: parsed.residentialAddress || null,
      voidChequeUploaded: parsed.voidChequeUploaded ?? false,
      hrNotes: parsed.hrNotes || null,
    },
  });

  await updateEmployeeSensitiveInfo(parsed.employeeId, {
    sinNumber: parsed.sinNumber,
    healthCardNumber: parsed.healthCardNumber,
    permitNumber: parsed.permitNumber,
  });

  revalidatePath("/hr/new-hire-info");
  revalidatePath("/hr/employees");
  revalidatePath("/hr");

  return null;
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function resendInviteEmail(employeeId: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  });

  // Invalidate any outstanding links before issuing a new one.
  await prisma.verificationToken.deleteMany({
    where: { identifier: employee.personalEmail },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: employee.personalEmail,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const acceptUrl = `${getBaseUrl()}/accept-invite?token=${token}`;
  const emailResult = await sendEmail({
    to: employee.personalEmail,
    subject: "Welcome to ClinicBoard — Set up your account",
    html: buildInviteEmailHtml({ fullName: employee.fullName, acceptUrl }),
  });

  return { ok: emailResult.ok };
}

// Archiving (not deleting) keeps the employee's full record — goals,
// documents, messages, schedule — for history. Only their portal login is
// revoked (see the ARCHIVED check in src/auth.ts).
export async function archiveEmployee(employeeId: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: employee.personalEmail },
  });
  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  revalidatePath("/hr/new-hire-info");
  revalidatePath("/hr/employees");
  revalidatePath("/hr/archive");
  revalidatePath("/hr");
}

export async function unarchiveEmployee(employeeId: string) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: "ACTIVE", archivedAt: null },
  });

  revalidatePath("/hr/new-hire-info");
  revalidatePath("/hr/employees");
  revalidatePath("/hr/archive");
  revalidatePath("/hr");
}
