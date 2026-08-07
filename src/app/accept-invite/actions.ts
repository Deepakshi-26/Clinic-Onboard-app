"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const SetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type SetPasswordState = { error: string } | null;

export async function setPassword(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const result = SetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue?.message === "passwordMismatch") return { error: "passwordMismatch" };
    return { error: "passwordTooShort" };
  }
  const { token, password } = result.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return { error: "invalidToken" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.identifier },
    data: { passwordHash },
  });

  // Single-use: clear every outstanding token for this identifier, not just
  // the one used, so an old resent link can't also still work afterward.
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

  redirect("/login?passwordSet=1");
}
