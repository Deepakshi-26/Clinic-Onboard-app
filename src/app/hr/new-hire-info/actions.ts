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

export async function updateEmployeeInfo(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const raw = Object.fromEntries(formData);
  const parsed = UpdateSchema.parse({
    ...raw,
    voidChequeUploaded: raw.voidChequeUploaded === "on",
  });

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
