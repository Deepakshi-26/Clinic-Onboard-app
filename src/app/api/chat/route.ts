import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildTrainingContext } from "@/lib/documentText";

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(20),
});

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

  const role = session.user.role;
  const employee =
    role === "EMPLOYEE"
      ? await prisma.employee.findUnique({ where: { userId: session.user.id } })
      : null;

  let accessNote: string;
  let trainingContext = "";

  if (role === "HR") {
    accessNote = "The user is HR and has full access to all portal information.";
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
        orderBy: { uploadedAt: "desc" },
      });
      trainingContext = await buildTrainingContext(documents);
    }
  }

  const systemPrompt = `You are ClinicBoard's onboarding assistant for a medical clinic in Montreal, Quebec.

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
- Bold at most one phrase in the whole answer, and only if it's the single most important word — most answers should have no bold at all.
- When (and only when) the answer is a process, workflow, decision path, or relationship between steps/roles, replace the prose with a small Mermaid diagram in its own \`\`\`mermaid fenced code block (a handful of nodes, no styling), plus at most one short sentence — don't also describe the diagram in words.
- If you name the source document, do it in passing (e.g. "per the confidentiality toolkit"), never as a formal citation line.`;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: parsed.data.messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return Response.json({ reply: textBlock?.text ?? "" });
  } catch (err) {
    console.error("Chat request failed:", err);
    return Response.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
