import "server-only";
import { put } from "@vercel/blob";

export async function uploadMessageAttachment(file: File) {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Attachment is too large — max 20MB.");
  }
  const blob = await put(`message-attachments/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url, name: file.name, size: file.size };
}
