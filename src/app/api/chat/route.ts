import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildRagContext, type RagSource } from "@/lib/rag";
import { getServerLocale } from "@/lib/i18n/server";
import { computeDaysElapsed } from "@/lib/progress";
import { getOrgSettings } from "@/lib/orgSettings";

const MAX_HISTORY = 20;
const ESCALATE_MARKER = "---ESCALATE---";

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  rows.reverse();

  return Response.json({
    messages: rows.map((r) => ({
      role: r.role === "USER" ? "user" : "assistant",
      content: r.content,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Chat is not configured yet. Contact your administrator." },
      { status: 503 }
    );
  }

  const parsed = ChatSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const userMessage = parsed.data.message;

  const role = session.user.role;
  const locale = await getServerLocale();
  const employee =
    role === "EMPLOYEE"
      ? await prisma.employee.findUnique({ where: { userId: session.user.id } })
      : null;
  const orgSettings = await getOrgSettings();
  const opsLeadName = orgSettings.opsLeadName?.trim() || "HR";

  let accessNote: string;
  let trainingContext = "";
  let sources: RagSource[] = [];
  let escalateInstruction = "";

  if (role === "HR") {
    accessNote = "The user is HR and has full access to all portal information.";
    const documents = await prisma.trainingDocument.findMany({
      select: { id: true, name: true },
      orderBy: { uploadedAt: "desc" },
    });
    const rag = await buildRagContext(userMessage, documents);
    trainingContext = rag.context;
    sources = rag.sources;
  } else {
    const daysElapsed = employee ? computeDaysElapsed(employee.startDate) : null;
    const durationDays = employee?.onboardingDurationDays ?? 30;
    accessNote = `The user is an onboarding employee (${employee?.title ?? "role unknown"} at ${
      employee?.location ?? "an unassigned location"
    })${
      daysElapsed !== null ? `, currently on day ${daysElapsed} of a ${durationDays}-day onboarding` : ""
    }. Calibrate answers to how far along they are (e.g. don't assume Month 3 context in Week 1). They have role-scoped access — only answer using the training document content provided below or general portal knowledge; for anything else, tell them to contact HR.`;

    if (employee) {
      const documents = await prisma.trainingDocument.findMany({
        where: {
          AND: [
            {
              OR: [
                { assignedEmployees: { some: { id: employee.id } } },
                { roles: { has: employee.title } },
              ],
            },
            { OR: [{ location: null }, { location: employee.location }] },
          ],
        },
        select: { id: true, name: true },
        orderBy: { uploadedAt: "desc" },
      });
      const rag = await buildRagContext(userMessage, documents);
      trainingContext = rag.context;
      sources = rag.sources;
    }

    escalateInstruction = `\n- If you cannot answer confidently from the training document excerpts above or general portal knowledge, don't guess. End your reply with a new line containing exactly "${ESCALATE_MARKER}" followed by a short, one-sentence draft question addressed to ${opsLeadName} that captures what they're asking.`;
  }

  const systemPrompt = `You are ClinicBoard's onboarding assistant for a medical clinic in Montreal, Quebec.

The portal's interface language is currently set to ${locale === "fr" ? "French" : "English"}. Always respond in ${locale === "fr" ? "French" : "English"}, regardless of what language the user types in.

${accessNote}

${trainingContext}

General portal knowledge:
- Clinic locations: Parc Extension, Montréal Nord, Côte-Vertu, Lachine
- Software used: MEDEXA and Myle
- Onboarding period is typically 30 or 60 days
- HR contact: hr@clinic.com · IT/equipment: it@clinic.com

Formatting rules — follow these strictly, answers that ignore them are considered wrong:
- Answer only the user's latest message. The conversation history is for context (e.g. understanding "what about the other one?"), not something to revisit — never recap, re-summarize, or re-answer an earlier question in this reply, even one you declined or escalated, unless the latest message explicitly asks you to.
- Write like a helpful colleague texting a quick answer, not a report. No section headers, no "From [Document], Section X:" citations, no restating the question.
- Default to 1-3 short bullet points or 1-2 short sentences. Never write more than that unless the user asks for detail.
- Default to no bold at all. The one exception: a bullet list naming multiple parallel terms (e.g. "X – definition", "Y – definition") may bold just the term at the start of each bullet — but then do it for every bullet in that list, never only some of them.
- When (and only when) the answer is a process, workflow, decision path, or relationship between steps/roles, replace the prose with a small Mermaid diagram in its own \`\`\`mermaid fenced code block (a handful of nodes, no styling), plus at most one short sentence — don't also describe the diagram in words.
- Don't cite source documents inline (e.g. no "per the confidentiality toolkit") — the app shows the source documents separately, so naming them in your prose would be redundant.${escalateInstruction}`;

  const historyRows = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY,
  });
  historyRows.reverse();

  const anthropicMessages = [
    ...historyRows.map((r) => ({
      role: r.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: r.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const rawReply = textBlock?.text ?? "";

    const markerIndex = rawReply.indexOf(ESCALATE_MARKER);
    const escalated = markerIndex !== -1;
    const replyText = (escalated ? rawReply.slice(0, markerIndex) : rawReply).trim();
    const draftQuestion = escalated
      ? rawReply.slice(markerIndex + ESCALATE_MARKER.length).trim()
      : null;

    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: "USER", content: userMessage },
        { userId: session.user.id, role: "ASSISTANT", content: replyText, escalated },
      ],
    });

    return Response.json({
      reply: replyText,
      sources: sources.map((s) => s.documentName),
      escalate: escalated
        ? { draftQuestion, opsLeadName, opsLeadEmail: orgSettings.opsLeadEmail }
        : null,
    });
  } catch (err) {
    console.error("Chat request failed:", err);
    return Response.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
