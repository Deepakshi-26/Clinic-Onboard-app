import "server-only";
import { randomUUID } from "crypto";
import { extractText, getDocumentProxy } from "unpdf";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { embedTexts } from "@/lib/embeddings";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const TOP_K = 6;
// A chunk only counts as an actual match if it's at least remotely
// plausible (below this absolute ceiling)...
const MAX_PLAUSIBLE_DISTANCE = 0.6;
// ...AND close to the single best match for this question, not just
// "somewhere in the top K." A fixed absolute cutoff alone doesn't work well
// with a small set of short, topically-similar documents — their distances
// all sit close together regardless of real relevance, so a relative gap
// from the best hit is a more reliable signal than any single number.
const RELEVANCE_MARGIN = 0.06;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function extractPdfText(fileUrl: string, fileName: string): Promise<string | null> {
  if (!fileName.toLowerCase().endsWith(".pdf")) return null;
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const buffer = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim() || null;
  } catch (err) {
    console.error(`Failed to extract text from ${fileName}:`, err);
    return null;
  }
}

// Chunks, embeds, and stores a training document's text for retrieval.
// Safe to call repeatedly (e.g. re-uploading the same file, or a manual
// "reindex" from HR) — existing chunks for the document are replaced.
export async function indexTrainingDocument(doc: {
  id: string;
  fileUrl: string;
  fileName: string;
}): Promise<void> {
  if (!process.env.OPENAI_API_KEY) return;

  const text = await extractPdfText(doc.fileUrl, doc.fileName);
  await prisma.documentChunk.deleteMany({ where: { documentId: doc.id } });
  if (!text) return;

  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);

  for (let i = 0; i < chunks.length; i++) {
    const vectorLiteral = `[${embeddings[i].join(",")}]`;
    await prisma.$executeRaw`
      INSERT INTO "DocumentChunk" ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt")
      VALUES (${randomUUID()}, ${doc.id}, ${i}, ${chunks[i]}, ${vectorLiteral}::vector, now())
    `;
  }
}

type RetrievedChunk = { documentId: string; documentName: string; content: string; distance: number };

async function searchDocumentChunks(
  query: string,
  documentIds: string[]
): Promise<RetrievedChunk[]> {
  if (documentIds.length === 0) return [];

  const [queryEmbedding] = await embedTexts([query]);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  return prisma.$queryRaw<RetrievedChunk[]>`
    SELECT dc."documentId" as "documentId", td.name as "documentName", dc.content as "content",
           (dc.embedding <=> ${vectorLiteral}::vector) as "distance"
    FROM "DocumentChunk" dc
    JOIN "TrainingDocument" td ON td.id = dc."documentId"
    WHERE dc."documentId" IN (${Prisma.join(documentIds)})
    ORDER BY dc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${TOP_K}
  `;
}

export type RagSource = { documentId: string; documentName: string };
export type RagResult = { context: string; sources: RagSource[] };

// Retrieval-augmented context for the chatbot: embeds the employee/HR's
// actual question and pulls only the most relevant chunks across the
// documents they're allowed to see, instead of stuffing whole documents in
// regardless of relevance. Also returns which documents were actually used,
// so the UI can show real citations instead of relying on the model to name
// them in prose.
export async function buildRagContext(
  query: string,
  documents: { id: string; name: string }[]
): Promise<RagResult> {
  if (documents.length === 0) {
    return { context: "No training documents are available.", sources: [] };
  }
  if (!process.env.OPENAI_API_KEY) {
    return {
      context: "Document search is not configured — answer from general portal knowledge only.",
      sources: [],
    };
  }

  const allChunks = await searchDocumentChunks(query, documents.map((d) => d.id));
  if (allChunks.length === 0) {
    return {
      context:
        "The assigned training documents haven't been indexed for search yet — an HR admin needs to click \"Index for AI search\" on the Documents page. Answer from general portal knowledge and mention this if relevant.",
      sources: [],
    };
  }

  const bestDistance = Math.min(...allChunks.map((c) => c.distance));
  const chunks =
    bestDistance > MAX_PLAUSIBLE_DISTANCE
      ? []
      : allChunks.filter((c) => c.distance <= bestDistance + RELEVANCE_MARGIN);
  if (chunks.length === 0) {
    return {
      context:
        "None of the training documents closely match this question — treat it as out of scope for the training material and answer from general portal knowledge only. Do not mention or cite a training document for this answer.",
      sources: [],
    };
  }

  const sections = chunks.map((c) => `### ${c.documentName}\n${c.content}`);
  const context = [
    "Relevant excerpts retrieved from the training documents, based on the question just asked. Use their content to answer:",
    ...sections,
  ].join("\n\n");

  const seen = new Map<string, string>();
  for (const c of chunks) seen.set(c.documentId, c.documentName);
  const sources = [...seen].map(([documentId, documentName]) => ({ documentId, documentName }));

  return { context, sources };
}
