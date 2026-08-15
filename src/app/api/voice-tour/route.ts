import "server-only";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerLocale } from "@/lib/i18n/server";
import { buildTourSteps } from "@/lib/voiceTour";

// Generated audio is deterministic for a given employee (their narration text
// doesn't change between requests), so a per-warm-instance cache avoids
// re-paying for TTS every time someone replays the tour.
const audioCache = new Map<string, string>();

async function synthesize(client: OpenAI, cacheKey: string, text: string) {
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;

  const response = await client.audio.speech.create({
    model: "tts-1-hd",
    voice: "nova",
    input: text,
    response_format: "mp3",
    // Natural speed, not scaled: the model's pacing is calibrated for 1.0,
    // and nudging it off that (even slightly) was producing uneven, rushed-
    // then-dragging delivery instead of a steadier read.
    speed: 1.0,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString("base64");
  audioCache.set(cacheKey, base64);
  return base64;
}

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "The voice tour isn't set up yet. Contact your administrator." },
      { status: 503 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return Response.json({ error: "No employee record found." }, { status: 404 });
  }

  const locale = await getServerLocale();
  const steps = buildTourSteps(employee, locale);

  try {
    const client = new OpenAI();
    const audio = await Promise.all(
      steps.map((step) => synthesize(client, `${employee.id}:${locale}:${step.id}`, step.narration))
    );

    return Response.json({
      steps: steps.map((step, i) => ({
        id: step.id,
        icon: step.icon,
        title: step.title,
        caption: step.narration,
        href: step.href,
        target: step.target ?? null,
        audioBase64: audio[i],
      })),
    });
  } catch (err) {
    console.error("Voice tour generation failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Couldn't prepare your voice tour: ${detail}` },
      { status: 502 }
    );
  }
}
