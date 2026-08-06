"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizePeerPair } from "@/lib/messages";

async function requireEmployee() {
  const session = await auth();
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Forbidden");
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) throw new Error("No onboarding record found for your account.");
  return employee;
}

const BodySchema = z.object({ body: z.string().min(1) });

export async function sendMessageToHr(formData: FormData) {
  const employee = await requireEmployee();
  const parsed = BodySchema.parse(Object.fromEntries(formData));

  await prisma.message.create({
    data: {
      channel: "HR_EMPLOYEE",
      employeeId: employee.id,
      senderRole: "EMPLOYEE",
      senderEmployeeId: employee.id,
      body: parsed.body,
    },
  });

  revalidatePath("/employee/messages");
  revalidatePath("/hr/messages");
}

const PeerSchema = z.object({
  peerEmployeeId: z.string().min(1),
  body: z.string().min(1),
});

export async function sendPeerMessage(formData: FormData) {
  const employee = await requireEmployee();
  const parsed = PeerSchema.parse(Object.fromEntries(formData));

  // Re-verify the peer is actually a valid onboarding colleague, not an
  // arbitrary ID from the client.
  const peer = await prisma.employee.findUnique({
    where: { id: parsed.peerEmployeeId },
  });
  if (!peer) throw new Error("Peer not found.");

  const [employeeId, peerEmployeeId] = normalizePeerPair(
    employee.id,
    parsed.peerEmployeeId
  );

  await prisma.message.create({
    data: {
      channel: "PEER",
      employeeId,
      peerEmployeeId,
      senderRole: "EMPLOYEE",
      senderEmployeeId: employee.id,
      body: parsed.body,
    },
  });

  revalidatePath("/employee/messages");
  revalidatePath("/hr/messages");
}
