import "server-only";
import { prisma } from "@/lib/db";
import { normalizePeerPair } from "@/lib/messages";

export async function getHrEmployeeThread(employeeId: string) {
  return prisma.message.findMany({
    where: { channel: "HR_EMPLOYEE", employeeId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPeerThread(employeeIdA: string, employeeIdB: string) {
  const [employeeId, peerEmployeeId] = normalizePeerPair(employeeIdA, employeeIdB);
  return prisma.message.findMany({
    where: { channel: "PEER", employeeId, peerEmployeeId },
    orderBy: { createdAt: "asc" },
  });
}

// Call when a user opens a thread — marks messages sent TO them (not by
// them) as read, so the sender's own bubbles can show a read indicator.
export async function markHrEmployeeThreadRead(
  employeeId: string,
  readerRole: "HR" | "EMPLOYEE"
) {
  const senderRoleToMark = readerRole === "HR" ? "EMPLOYEE" : "HR";
  await prisma.message.updateMany({
    where: {
      channel: "HR_EMPLOYEE",
      employeeId,
      senderRole: senderRoleToMark,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function markPeerThreadRead(
  employeeIdA: string,
  employeeIdB: string,
  readerEmployeeId: string
) {
  const [employeeId, peerEmployeeId] = normalizePeerPair(employeeIdA, employeeIdB);
  await prisma.message.updateMany({
    where: {
      channel: "PEER",
      employeeId,
      peerEmployeeId,
      senderEmployeeId: { not: readerEmployeeId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}
