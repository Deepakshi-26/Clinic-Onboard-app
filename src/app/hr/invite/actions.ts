"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { defaultGoalSet } from "@/lib/default-goals";

const InviteSchema = z.object({
  fullName: z.string().min(1),
  personalEmail: z.string().email(),
  title: z.enum([
    "PHYSIOTHERAPIST",
    "OCCUPATIONAL_THERAPIST",
    "PHYSIO_ASSISTANT",
    "OT_ASSISTANT",
    "PHYSIO_TECHNOLOGIST",
    "DOCTOR",
    "REHAB_ADMIN",
    "MEDICAL_ADMIN",
    "CNESST_ADMIN",
    "SAAQ_ADMIN",
    "BC_ADMIN",
    "HR",
    "MANAGER",
  ]),
  location: z.enum(["PARC_EXTENSION", "MONTREAL_NORD", "COTE_VERTU", "LACHINE"]),
  startDate: z.string().min(1),
  onboardingDurationDays: z.coerce.number().int().positive(),
  trainerName: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export type InviteActionState = { error: string } | null;

export async function createInvite(
  _prevState: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const session = await auth();
  if (session?.user?.role !== "HR") {
    return { error: "Forbidden" };
  }

  const result = InviteSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: "Please fill in all required fields correctly." };
  }
  const parsed = result.data;

  const existing = await prisma.user.findUnique({
    where: { email: parsed.personalEmail },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const tempPassword = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.personalEmail,
      passwordHash,
      role: "EMPLOYEE",
      employee: {
        create: {
          fullName: parsed.fullName,
          personalEmail: parsed.personalEmail,
          title: parsed.title,
          location: parsed.location,
          startDate: new Date(parsed.startDate),
          onboardingDurationDays: parsed.onboardingDurationDays,
          trainerName: parsed.trainerName || null,
          welcomeMessage: parsed.welcomeMessage || null,
          status: "ACTIVE",
          goals: { create: defaultGoalSet },
        },
      },
    },
    include: { employee: true },
  });

  await prisma.emailLog.create({
    data: {
      kind: "INVITE",
      toEmail: parsed.personalEmail,
      subject: "Welcome to ClinicBoard",
      body: `Hi ${parsed.fullName}, your onboarding portal account is ready. Check your email for login instructions.`,
      employeeId: user.employee!.id,
    },
  });

  // DEV-ONLY: the temp password is never persisted, only logged here so it
  // can be used to sign in and test the new hire's account during development.
  console.log(
    `[stub email] Invite sent to ${parsed.personalEmail} — temp password: ${tempPassword}`
  );

  revalidatePath("/hr/employees");
  revalidatePath("/hr");
  redirect(`/hr/employees?employeeId=${user.employee!.id}`);
}
