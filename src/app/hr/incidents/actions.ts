"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const IncidentSchema = z.object({
  whatHappened: z.string().min(1),
  whoAffected: z.string().optional(),
  actionsTaken: z.string().optional(),
  occurredAt: z.string().optional(),
});

export type IncidentActionState = { error: string } | null;

export async function logIncident(
  _prevState: IncidentActionState,
  formData: FormData
): Promise<IncidentActionState> {
  const session = await auth();
  if (session?.user?.role !== "HR") return { error: "forbidden" };

  const parsed = IncidentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };

  await prisma.incidentLog.create({
    data: {
      reportedByUserId: session.user.id,
      reportedByEmail: session.user.email ?? "",
      whatHappened: parsed.data.whatHappened,
      whoAffected: parsed.data.whoAffected || null,
      actionsTaken: parsed.data.actionsTaken || null,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : null,
    },
  });

  revalidatePath("/hr/incidents");
  return null;
}
