"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

export type WaitlistActionState = { error: string } | { ok: true } | null;

const WaitlistSchema = z.object({
  email: z.string().email(),
});

export async function joinWaitlist(
  _prevState: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const result = WaitlistSchema.safeParse({ email: formData.get("email") });
  if (!result.success) {
    return { error: "invalid" };
  }

  try {
    await prisma.waitlistSignup.create({ data: { email: result.data.email } });
  } catch {
    // Unique constraint on email — someone signing up twice isn't an error
    // from their point of view, just show the same success state.
  }

  return { ok: true };
}
