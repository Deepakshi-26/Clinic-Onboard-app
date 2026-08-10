import "server-only";
import { Resend } from "resend";
import { LOCATION_ADDRESSES } from "@/lib/labels";
import type { Location } from "@prisma/client";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ClinicBoard <onboarding@resend.dev>";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email not configured] Would send to ${to}: ${subject}`);
    return { ok: false, error: "Email is not configured yet." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, error: "Failed to send email." };
  }
}

const emailWrapper = (bodyHtml: string) => `
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <div style="font-size: 20px; font-weight: 700; color: #0D7377; margin-bottom: 20px;">
    Clinic<span style="color: #1e293b;">Board</span>
  </div>
  ${bodyHtml}
  <p style="margin-top: 32px; font-size: 11px; color: #94a3b8;">
    This is an automated message from your clinic's staff onboarding portal.
  </p>
</div>
`;

export function buildInviteEmailHtml(params: {
  fullName: string;
  acceptUrl: string;
  location?: Location;
}): string {
  const clinic = params.location ? LOCATION_ADDRESSES[params.location] : undefined;
  const clinicBlock = clinic
    ? `
    <div style="margin-top: 24px; padding: 14px 16px; background: #f1f5f9; border-radius: 10px; font-size: 13px; color: #334155; line-height: 1.6;">
      <strong style="color: #1e293b;">${clinic.name}</strong><br/>
      ${clinic.address}<br/>
      Tel / Tél: ${clinic.phone}${clinic.email ? `<br/>Email / Courriel: ${clinic.email}` : ""}
    </div>`
    : "";

  return emailWrapper(`
    <p style="font-size: 15px; color: #1e293b;">Hi ${params.fullName},</p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Welcome to the clinic! Your staff onboarding portal account is ready.
      Click below to set your password and log in — this link expires in 7 days.
    </p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Bienvenue à la clinique! Votre compte du portail d'intégration est prêt.
      Cliquez ci-dessous pour configurer votre mot de passe — ce lien expire dans 7 jours.
    </p>
    <a href="${params.acceptUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #0D7377; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
      Set Your Password / Configurer votre mot de passe
    </a>
    ${clinicBlock}
  `);
}

export function buildReminderEmailHtml(params: { fullName: string }): string {
  return emailWrapper(`
    <p style="font-size: 15px; color: #1e293b;">Hi ${params.fullName},</p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Just a friendly reminder that you have outstanding documents to submit on
      your onboarding portal. Please log in and complete them before your
      deadline. Let us know if you need any help!
    </p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Petit rappel amical: il vous reste des documents à soumettre sur votre
      portail d'intégration. Veuillez vous connecter et les compléter avant
      votre échéance. N'hésitez pas à nous contacter si vous avez besoin d'aide!
    </p>
  `);
}
