import "server-only";
import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function logAudit(entry: {
  actorUserId: string;
  actorEmail: string;
  action: AuditAction;
  targetEmployeeId?: string;
  detail?: string;
}) {
  await prisma.auditLog.create({ data: entry });
}
