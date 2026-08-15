"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAccessCredential } from "@/lib/repositories/access";
import { logAudit } from "@/lib/audit";
import type { Location } from "@prisma/client";

type RevealableField = "medexaPassword" | "mylePassword";

// Re-verifies the employee's own portal password before ever sending a
// decrypted secret to the browser — the masked "••••••••" shown by default
// is a real placeholder, not a peek at real characters, so this is the only
// path that can produce the actual value client-side.
type RevealError = "forbidden" | "notFound" | "incorrectPassword" | "notSet";

export async function revealAccessSecret(
  location: Location,
  field: RevealableField,
  confirmPassword: string
): Promise<{ ok: true; value: string } | { ok: false; error: RevealError }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    return { ok: false, error: "forbidden" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "notFound" };

  const valid = await bcrypt.compare(confirmPassword, user.passwordHash);
  if (!valid) return { ok: false, error: "incorrectPassword" };

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) return { ok: false, error: "notFound" };

  const credential = await getAccessCredential(employee.id, location);
  const value = credential?.[field];
  if (!value) return { ok: false, error: "notSet" };

  await logAudit({
    actorUserId: session.user.id,
    actorEmail: session.user.email ?? "",
    action: "VIEW_SENSITIVE_INFO",
    targetEmployeeId: employee.id,
    detail: `Revealed ${field} for ${location}`,
  });

  return { ok: true, value };
}
