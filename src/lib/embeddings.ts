import "server-only";
import OpenAI from "openai";

// 1536 dimensions — must match the DocumentChunk.embedding column type
// (vector(1536)) in prisma/schema.prisma.
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const client = new OpenAI();
  const res = await client.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
  return res.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
