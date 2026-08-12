"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendEmail, buildLoginOtpEmailHtml } from "@/lib/email";

export type RequestOtpResult = { ok: true } | { ok: false; error: string };

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestLoginOtp(
  email: string,
  password: string
): Promise<RequestOtpResult> {
  if (!email || !password) {
    return { ok: false, error: "invalidCredentials" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true },
  });
  if (!user) return { ok: false, error: "invalidCredentials" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: "invalidCredentials" };

  // Same access rule as authorize() in src/auth.ts — don't bother sending a
  // code to an account that couldn't log in anyway.
  if (user.employee?.status === "INACTIVE") {
    return { ok: false, error: "invalidCredentials" };
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.loginOtp.create({
    data: {
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const result = await sendEmail({
    to: email,
    subject: "Your ClinicBoard sign-in code / Votre code de connexion",
    html: buildLoginOtpEmailHtml({ code }),
  });
  if (!result.ok) return { ok: false, error: "otpSendFailed" };

  return { ok: true };
}
