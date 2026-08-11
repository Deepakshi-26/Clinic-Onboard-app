import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerLocale } from "@/lib/i18n/server";
import { getDueCheckInDay } from "@/lib/checkin";
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
  const dueDay = getDueCheckInDay(
    employee,
    existingCheckIns.map((c) => c.dayOffset)
  );
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

Your job: have a warm, brief, natural spoken conversation. Ask how things are going, whether they've hit any blockers, whether their trainer/HR have been helpful, and whether they have questions. Keep it conversational — one topic at a time, short sentences, like a real phone call, not an interview script.

CRITICAL formatting rule: your output is converted directly to speech. Never use markdown, bullet points, bold, emoji, or any written-text formatting — plain spoken sentences only.

Keep the whole call to roughly 3-5 of your turns. When the conversation feels naturally complete (or you're told to wrap up), give a brief warm closing, then on a new line write exactly "${SUMMARY_MARKER}" followed by a 2-3 sentence plain-text summary for HR of how the employee is doing and anything HR should follow up on. Do not include the marker or summary unless you are ending the call.`;

  const anthropicMessages: { role: "user" | "assistant"; content: string }[] =
    turns.length === 0
      ? [
          {
            role: "user",
            content:
              "(The employee has just joined their check-in call. Greet them warmly by name and start the conversation.)",
          },
        ]
      : [...turns];

  if (forceEnd) {
    anthropicMessages.push({
      role: "user",
      content:
        "(The call needs to end now. Give a brief warm closing and include the summary as instructed.)",
    });
  }

  try {
    const claude = new Anthropic();
    const response = await claude.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 512,
      system: systemPrompt,
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

    const openai = new OpenAI();
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: spokenReply,
      response_format: "mp3",
    });
    const audioBase64 = Buffer.from(await speech.arrayBuffer()).toString("base64");

    return Response.json({ reply: spokenReply, audioBase64, done, dayOffset: dueDay });
  } catch (err) {
    console.error("Check-in turn failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return Response.json({ error: `Couldn't continue the check-in: ${detail}` }, { status: 502 });
  }
}
