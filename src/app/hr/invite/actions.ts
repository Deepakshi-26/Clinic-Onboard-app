"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { defaultGoalSet } from "@/lib/default-goals";
import { buildInviteEmailHtml, getBaseUrl, sendEmail } from "@/lib/email";

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

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

  // The account's real password is set by the new hire via the emailed
  // accept-invite link — this hash is a random, never-revealed placeholder
  // that makes the account impossible to log into until then.
  const unusablePassword = crypto.randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(unusablePassword, 10);

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

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: parsed.personalEmail,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const acceptUrl = `${getBaseUrl()}/accept-invite?token=${token}`;
  const emailResult = await sendEmail({
    to: parsed.personalEmail,
    subject: "Welcome to ClinicBoard — Set up your account",
    html: buildInviteEmailHtml({ fullName: parsed.fullName, acceptUrl }),
  });

  await prisma.emailLog.create({
    data: {
      kind: "INVITE",
      toEmail: parsed.personalEmail,
      subject: "Welcome to ClinicBoard",
      body: `Hi ${parsed.fullName}, your onboarding portal account is ready. Check your email for a link to set your password.`,
      employeeId: user.employee!.id,
    },
  });

  revalidatePath("/hr/employees");
  revalidatePath("/hr");
  redirect(
    `/hr/employees?employeeId=${user.employee!.id}&emailStatus=${emailResult.ok ? "sent" : "failed"}`
  );
}
