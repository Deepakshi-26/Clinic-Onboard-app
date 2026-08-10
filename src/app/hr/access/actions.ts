"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { upsertAccessCredential } from "@/lib/repositories/access";

const CredentialSchema = z.object({
  employeeId: z.string().min(1),
  location: z.enum(["PARC_EXTENSION", "MONTREAL_NORD", "COTE_VERTU", "LACHINE"]),
  workEmail: z.string().optional(),
  doorPasscode: z.string().optional(),
  buildingPasscode: z.string().optional(),
  wifiPassword: z.string().optional(),
  medexaUsername: z.string().optional(),
  medexaPassword: z.string().optional(),
  medexaLink: z.string().optional(),
  myleUsername: z.string().optional(),
  mylePassword: z.string().optional(),
  myleLink: z.string().optional(),
  equipmentBoxLocation: z.string().optional(),
  equipmentRequestEmail: z.string().optional(),
  trainerName: z.string().optional(),
  parkingEnabled: z.coerce.boolean().optional(),
  parkingNote: z.string().optional(),
});

export async function updateAccessCredential(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const raw = Object.fromEntries(formData);
  const parsed = CredentialSchema.parse({
    ...raw,
    parkingEnabled: raw.parkingEnabled === "on",
  });

  await upsertAccessCredential(parsed.employeeId, parsed.location, {
    workEmail: parsed.workEmail,
    doorPasscode: parsed.doorPasscode,
    buildingPasscode: parsed.buildingPasscode,
    wifiPassword: parsed.wifiPassword,
    medexaUsername: parsed.medexaUsername,
    medexaPassword: parsed.medexaPassword,
    medexaLink: parsed.medexaLink,
    myleUsername: parsed.myleUsername,
    mylePassword: parsed.mylePassword,
    myleLink: parsed.myleLink,
    equipmentBoxLocation: parsed.equipmentBoxLocation,
    equipmentRequestEmail: parsed.equipmentRequestEmail,
    trainerName: parsed.trainerName,
    parkingEnabled: parsed.parkingEnabled,
    parkingNote: parsed.parkingNote,
  });

  revalidatePath("/hr/access");
  revalidatePath("/employee/access");
}
