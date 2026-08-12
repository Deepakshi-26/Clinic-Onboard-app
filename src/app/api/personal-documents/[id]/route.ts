import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { decryptBuffer } from "@/lib/encryption";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const doc = await prisma.personalDocument.findUnique({
    where: { id },
    include: { employee: { select: { userId: true } } },
  });
  if (!doc) {
    return new Response("Not found", { status: 404 });
  }

  // HR can view any employee's submitted documents (matches the existing
  // New Hire Info review screen); an employee can only view their own.
  const isOwner = doc.employee.userId === session.user.id;
  const isHr = session.user.role === "HR";
  if (!isOwner && !isHr) {
    return new Response("Forbidden", { status: 403 });
  }

  const blobRes = await fetch(doc.fileUrl);
  if (!blobRes.ok) {
    return new Response("File unavailable", { status: 502 });
  }
  const raw = Buffer.from(await blobRes.arrayBuffer());

  // Documents uploaded before encryption was added are stored as plain
  // bytes — fall back to serving them as-is rather than failing decryption.
  let body: Buffer;
  try {
    body = decryptBuffer(raw);
  } catch {
    body = raw;
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": doc.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
