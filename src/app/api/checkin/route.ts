import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerLocale } from "@/lib/i18n/server";
import { getNextCheckInDay } from "@/lib/checkin";
import {
  computeDaysElapsed,
  computeGoalsProgress,
  computeMissingDocs,
} from "@/lib/progress";
import { titleLabel, locationLabel } from "@/lib/labels";

const MAX_TURNS = 16; // safety cap: force a close after this many turns regardless

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const CheckInSchema = z.object({
  turns: z.array(TurnSchema).max(MAX_TURNS),
  forceEnd: z.boolean().optional(),
});

const SUMMARY_MARKER = "---SUMMARY---";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY || !process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "The voice check-in isn't set up yet. Contact your administrator." },
      { status: 503 }
    );
  }

  const parsed = CheckInSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { turns } = parsed.data;
  const forceEnd = parsed.data.forceEnd || turns.length >= MAX_TURNS;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { goals: true },
  });
  if (!employee) {
    return Response.json({ error: "No employee record found." }, { status: 404 });
  }

  const existingCheckIns = await prisma.checkIn.findMany({
    where: { employeeId: employee.id },
    select: { dayOffset: true },
  });
  const completedDayOffsets = existingCheckIns.map((c) => c.dayOffset);
  const dueDay = getNextCheckInDay(employee, completedDayOffsets);
  if (dueDay === null) {
    return Response.json({ error: "No check-in is due right now." }, { status: 400 });
  }

  const locale = await getServerLocale();
  const firstName = employee.fullName.split(" ")[0];
  const role = titleLabel(employee.title, locale);
  const location = locationLabel(employee.location, locale);
  const { pct: goalsPct, done: goalsDone, total: goalsTotal } = computeGoalsProgress(
    employee.goals
  );
  const missingDocs = computeMissingDocs(employee).length;
  const daysElapsed = computeDaysElapsed(employee.startDate);

  const systemPrompt = `You are ClinicBoard's AI onboarding check-in caller. You are conducting a brief SPOKEN phone-style check-in with ${firstName}, a ${role} at the ${location} clinic location, who is ${daysElapsed} days into onboarding. This is their Day ${dueDay} check-in.

Context on their progress (use this to ask relevant, specific questions — don't just recite these numbers):
- Task/goal completion: ${goalsDone}/${goalsTotal} (${goalsTotal === 0 ? "no goals assigned yet" : `${goalsPct}%`})
- Missing personal documents: ${missingDocs}
- Trainer assigned: ${employee.trainerName ?? "none yet"}

Your job: have a warm, kind, brief, natural spoken conversation — the tone of a supportive mentor checking in, not an interviewer running through a checklist. Ask how things are going, whether they've hit any blockers, whether their trainer/HR have been helpful, and whether they have questions. Genuinely acknowledge what they've accomplished so far and offer real encouragement before moving on — people should come away from this call feeling motivated, not interrogated. Keep it conversational — one topic at a time, short sentences, like a real phone call, not a script.

CRITICAL language rule: the portal's interface language is ${locale === "fr" ? "French" : "English"}. Speak ONLY in ${locale === "fr" ? "French" : "English"} for the entire call, no matter what language the employee replies in.

CRITICAL formatting rule: your output is converted directly to speech. Never use markdown, bullet points, bold, emoji, or any written-text formatting. Also avoid em dashes and semicolons entirely. They make text-to-speech sound rushed then dragging instead of steady, so use short, simple sentences separated by periods instead.

Keep the whole call to roughly 3-5 of your turns. When the conversation feels naturally complete (or you're told to wrap up), give a brief warm closing, then on a new line write exactly "${SUMMARY_MARKER}" followed by a 2-3 sentence plain-text summary for HR of how the employee is doing and anything HR should follow up on. Do not include the marker or summary unless you are ending the call.`;

  // Written in the target locale, not just described as such in the system
  // prompt — a stray English instruction here was enough to bias the AI's
  // opening reply into English even with an explicit French system rule.
  const kickoffMessage =
    locale === "fr"
      ? "(L'employé vient de rejoindre son appel de suivi. Accueille-le chaleureusement par son prénom et commence la conversation, en français.)"
      : "(The employee has just joined their check-in call. Greet them warmly by name and start the conversation, in English.)";
  const wrapUpMessage =
    locale === "fr"
      ? "(L'appel doit se terminer maintenant. Donne une brève conclusion chaleureuse en français et inclus le résumé comme indiqué.)"
      : "(The call needs to end now. Give a brief warm closing in English and include the summary as instructed.)";

  const anthropicMessages: { role: "user" | "assistant"; content: string }[] =
    turns.length === 0 ? [{ role: "user", content: kickoffMessage }] : [...turns];

  if (forceEnd) {
    anthropicMessages.push({ role: "user", content: wrapUpMessage });
  }

  try {
    const claude = new Anthropic();
    const response = await claude.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      // Cached across this call's turns — the system prompt is identical
      // turn-to-turn within one check-in, so this cuts the "thinking" wait
      // on every reply after the first instead of reprocessing it each time.
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: anthropicMessages,
    });
    const textBlock = response.content.find((block) => block.type === "text");
    const rawReply = textBlock?.text ?? "";

    const markerIndex = rawReply.indexOf(SUMMARY_MARKER);
    const done = markerIndex !== -1;
    const spokenReply = (done ? rawReply.slice(0, markerIndex) : rawReply).trim();
    const summary = done ? rawReply.slice(markerIndex + SUMMARY_MARKER.length).trim() : null;

    if (done) {
      const fullTurns = [...turns, { role: "assistant" as const, content: spokenReply }];
      const transcript = fullTurns
        .map((t) => `${t.role === "user" ? "Employee" : "AI"}: ${t.content}`)
        .join("\n");

      await prisma.checkIn.upsert({
        where: { employeeId_dayOffset: { employeeId: employee.id, dayOffset: dueDay } },
        create: {
          employeeId: employee.id,
          dayOffset: dueDay,
          transcript,
          summary,
        },
        update: { transcript, summary },
      });
    }

    // Plain tts-1 here, not the -hd variant: this is a live back-and-forth
    // call where every turn pays this cost, so speed matters more than the
    // small quality bump — unlike the voice tour, whose audio is generated
    // once and cached, not synthesized live on every interaction.
    const openai = new OpenAI();
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: spokenReply,
      response_format: "mp3",
      // Natural speed, not scaled: see the matching note in the voice-tour
      // route. Scaling away from 1.0 was making delivery feel uneven.
      speed: 1.0,
    });
    const audioBase64 = Buffer.from(await speech.arrayBuffer()).toString("base64");

    return Response.json({ reply: spokenReply, audioBase64, done, dayOffset: dueDay });
  } catch (err) {
    console.error("Check-in turn failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return Response.json({ error: `Couldn't continue the check-in: ${detail}` }, { status: 502 });
  }
}
