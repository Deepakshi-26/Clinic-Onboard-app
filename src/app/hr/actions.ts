"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildReminderEmailHtml, sendEmail } from "@/lib/email";
import { computeMissingDocs } from "@/lib/progress";
import { getOrgSettings } from "@/lib/orgSettings";
import { locationLabel, titleLabel } from "@/lib/labels";
import { getServerLocale } from "@/lib/i18n/server";

// Hands the nudge off to an n8n workflow (webhook -> AI drafts the message ->
// sends it) instead of the hardcoded email template below. Returns false
// (never throws) whenever no webhook is configured or the call fails, so
// sendReminder() can fall back to the direct email path either way.
async function triggerNudgeWorkflow(payload: Record<string, unknown>): Promise<boolean> {
  const webhookUrl = process.env.N8N_NUDGE_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error("n8n nudge webhook failed:", err);
    return false;
  }
}

export async function sendReminder(employeeId: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  });

  const locale = await getServerLocale();
  const missing = computeMissingDocs(employee);
  const orgSettings = await getOrgSettings();

  const nudgedViaN8n = await triggerNudgeWorkflow({
    employeeId: employee.id,
    employeeName: employee.fullName,
    employeeEmail: employee.personalEmail,
    title: titleLabel(employee.title, locale),
    location: locationLabel(employee.location, locale),
    missingDocCount: missing.length,
    opsLeadName: orgSettings.opsLeadName,
    opsLeadEmail: orgSettings.opsLeadEmail,
  });

  const emailResult = nudgedViaN8n
    ? { ok: true as const }
    : await sendEmail({
        to: employee.personalEmail,
        subject: "Reminder: outstanding onboarding documents",
        html: buildReminderEmailHtml({ fullName: employee.fullName }),
      });

  await prisma.emailLog.create({
    data: {
      kind: "REMINDER",
      toEmail: employee.personalEmail,
      subject: "Reminder: outstanding onboarding documents",
      body: nudgedViaN8n
        ? "Sent via the n8n Smart Nudge workflow."
        : `Hi ${employee.fullName}! Just a friendly reminder that you have outstanding documents to submit on your onboarding portal. Please log in and complete them before your deadline. Let us know if you need any help!`,
      employeeId: employee.id,
    },
  });

  revalidatePath("/hr");
  revalidatePath("/hr/employees");

  return { ok: nudgedViaN8n || emailResult.ok };
}

// Owner submitted this by mistake, it's a duplicate, or HR decided not to
// pursue it — removes it from the dashboard without touching anything else.
export async function dismissPendingHire(pendingHireId: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (session?.user?.role !== "HR") throw new Error("Forbidden");

  await prisma.pendingHire.update({
    where: { id: pendingHireId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/hr");
  return { ok: true };
}
