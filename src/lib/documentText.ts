import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_CHARS_PER_DOC = 4000;
const MAX_DOCS = 6;

// Extracted text rarely changes (documents are replaced, not edited), so a
// per-warm-instance cache avoids re-fetching/re-parsing the same PDF on
// every chat message.
const cache = new Map<string, string | null>();

async function extractOne(doc: { id: string; fileUrl: string; fileName: string }) {
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
    const trimmed = text.trim().slice(0, MAX_CHARS_PER_DOC);
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
  const excerpts = await Promise.all(subset.map(extractOne));

  const sections = subset.map((doc, i) => {
    const excerpt = excerpts[i];
    return excerpt
      ? `### ${doc.name} (${doc.docType})\n${excerpt}`
      : `### ${doc.name} (${doc.docType})\n[Content not available for preview — direct the employee to open it from the Training page.]`;
  });

  return [
    "The employee has the following training documents assigned. Use their content to answer questions, and mention the document name when you do:",
    ...sections,
  ].join("\n\n");
}
