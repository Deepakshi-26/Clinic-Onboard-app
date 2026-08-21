"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateOrgSettings } from "@/lib/orgSettings";

const SettingsSchema = z.object({
  clinicName: z.string().optional(),
  privacyOfficerName: z.string().optional(),
  privacyOfficerEmail: z.string().email().optional().or(z.literal("")),
  opsLeadName: z.string().optional(),
  opsLeadEmail: z.string().email().optional().or(z.literal("")),
});

export type SettingsActionState = { error: string } | { ok: true } | null;

export async function saveOrgSettings(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await auth();
  if (session?.user?.role !== "HR") return { error: "forbidden" };

  const parsed = SettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };

  await updateOrgSettings({
    clinicName: parsed.data.clinicName || undefined,
    privacyOfficerName: parsed.data.privacyOfficerName || undefined,
    privacyOfficerEmail: parsed.data.privacyOfficerEmail || undefined,
    opsLeadName: parsed.data.opsLeadName || undefined,
    opsLeadEmail: parsed.data.opsLeadEmail || undefined,
  });

  revalidatePath("/hr/settings");
  revalidatePath("/privacy");
  return { ok: true };
}
