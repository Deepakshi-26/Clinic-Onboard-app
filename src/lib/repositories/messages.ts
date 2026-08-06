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
