import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_DOCS = 6;
// Per-document and total character budgets, so one huge manual doesn't
// starve the others out, but a single assigned document still gets its
// full text (most training PDFs are well under this).
const MAX_CHARS_PER_DOC = 200_000;
const MAX_TOTAL_CHARS = 400_000;

// Extracted text rarely changes (documents are replaced, not edited), so a
// per-warm-instance cache avoids re-fetching/re-parsing the same PDF on
// every chat message.
const cache = new Map<string, string | null>();

async function extractFullText(doc: { id: string; fileUrl: string; fileName: string }) {
  if (cache.has(doc.id)) return cache.get(doc.id) ?? null;

  if (!doc.fileName.toLowerCase().endsWith(".pdf")) {
    cache.set(doc.id, null);
    return null;
  }

  try {
    const res = await fetch(doc.fileUrl);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const buffer = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const trimmed = text.trim();
    cache.set(doc.id, trimmed);
    return trimmed;
  } catch (err) {
    console.error(`Failed to extract text from document ${doc.id}:`, err);
    cache.set(doc.id, null);
    return null;
  }
}

export async function buildTrainingContext(
  documents: { id: string; name: string; docType: string; fileUrl: string; fileName: string }[]
) {
  if (documents.length === 0) return "This employee has no training documents assigned yet.";

  const subset = documents.slice(0, MAX_DOCS);
  const fullTexts = await Promise.all(subset.map(extractFullText));

  let remainingBudget = MAX_TOTAL_CHARS;
  const sections = subset.map((doc, i) => {
    const fullText = fullTexts[i];
    if (!fullText) {
      return `### ${doc.name} (${doc.docType})\n[Content not available for preview — direct the employee to open it from the Training page.]`;
    }
    const allowance = Math.min(MAX_CHARS_PER_DOC, remainingBudget);
    const excerpt = fullText.slice(0, allowance);
    remainingBudget -= excerpt.length;
    const truncatedNote = excerpt.length < fullText.length ? "\n[...document truncated...]" : "";
    return `### ${doc.name} (${doc.docType})\n${excerpt}${truncatedNote}`;
  });

  return [
    "The employee has the following training documents assigned. Use their content to answer questions, and mention the document name when you do:",
    ...sections,
  ].join("\n\n");
}
