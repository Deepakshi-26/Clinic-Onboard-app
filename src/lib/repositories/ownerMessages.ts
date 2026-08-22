import "server-only";
import { prisma } from "@/lib/db";

export async function getOwnerThread(ownerId: string) {
  return prisma.ownerMessage.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
  });
}

// Call when a user opens the thread — marks messages sent TO them (not by
// them) as read, so the sender's own bubbles can show a read indicator.
export async function markOwnerThreadRead(
  ownerId: string,
  readerRole: "HR" | "OWNER"
) {
  const senderRoleToMark = readerRole === "HR" ? "OWNER" : "HR";
  await prisma.ownerMessage.updateMany({
    where: { ownerId, senderRole: senderRoleToMark, readAt: null },
    data: { readAt: new Date() },
  });
}
