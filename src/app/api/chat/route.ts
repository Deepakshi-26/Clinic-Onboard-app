import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildRagContext } from "@/lib/rag";
import { getServerLocale } from "@/lib/i18n/server";

const MAX_HISTORY = 20;

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

  let accessNote: string;
  let trainingContext = "";

  if (role === "HR") {
    accessNote = "The user is HR and has full access to all portal information.";
    const documents = await prisma.trainingDocument.findMany({
      select: { id: true, name: true },
      orderBy: { uploadedAt: "desc" },
    });
    trainingContext = await buildRagContext(userMessage, documents);
  } else {
    accessNote = `The user is an onboarding employee (${employee?.title ?? "role unknown"} at ${
      employee?.location ?? "an unassigned location"
    }). They have role-scoped access — only answer using the training document content provided below or general portal knowledge; for anything else, tell them to contact HR.`;

    if (employee) {
      const documents = await prisma.trainingDocument.findMany({
        where: {
          OR: [
            { assignedEmployees: { some: { id: employee.id } } },
            { roles: { has: employee.title } },
          ],
        },
        select: { id: true, name: true },
        orderBy: { uploadedAt: "desc" },
      });
      trainingContext = await buildRagContext(userMessage, documents);
    }
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
- Write like a helpful colleague texting a quick answer, not a report. No section headers, no "From [Document], Section X:" citations, no restating the question.
- Default to 1-3 short bullet points or 1-2 short sentences. Never write more than that unless the user asks for detail.
- Default to no bold at all. The one exception: a bullet list naming multiple parallel terms (e.g. "X – definition", "Y – definition") may bold just the term at the start of each bullet — but then do it for every bullet in that list, never only some of them.
- When (and only when) the answer is a process, workflow, decision path, or relationship between steps/roles, replace the prose with a small Mermaid diagram in its own \`\`\`mermaid fenced code block (a handful of nodes, no styling), plus at most one short sentence — don't also describe the diagram in words.
- If you name the source document, do it in passing (e.g. "per the confidentiality toolkit"), never as a formal citation line.`;

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
    const replyText = textBlock?.text ?? "";

    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: "USER", content: userMessage },
        { userId: session.user.id, role: "ASSISTANT", content: replyText },
      ],
    });

    return Response.json({ reply: replyText });
  } catch (err) {
    console.error("Chat request failed:", err);
    return Response.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
