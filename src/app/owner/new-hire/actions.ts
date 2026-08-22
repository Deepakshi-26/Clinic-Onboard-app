"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { JobTitle, Location } from "@prisma/client";

const NewHireSchema = z.object({
  fullName: z.string().min(1),
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
  personalEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type SubmitNewHireState = { error: string } | { ok: true } | null;

// The Owner's entire job in this flow: name a new hire and hand it to HR.
// This never creates a portal account by itself — HR still reviews and
// sends the actual invite from src/app/hr/invite, same as always.
export async function submitNewHire(
  _prevState: SubmitNewHireState,
  formData: FormData
): Promise<SubmitNewHireState> {
  const session = await auth();
  if (session?.user?.role !== "OWNER") return { error: "forbidden" };

  const parsed = NewHireSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "invalid" };
  }
  const data = parsed.data;

  await prisma.pendingHire.create({
    data: {
      submittedById: session.user.id,
      fullName: data.fullName,
      title: data.title as JobTitle,
      location: data.location as Location,
      personalEmail: data.personalEmail || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/owner/new-hire");
  revalidatePath("/owner");
  revalidatePath("/hr");
  return { ok: true };
}
