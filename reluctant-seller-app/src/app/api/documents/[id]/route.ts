import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ensureDefaultPlaybookDocument, getDocumentBySlug, logDocumentAccess } from "@/lib/documents";
import { forbidden, unauthorized } from "@/lib/errors";
import { getAuthorizedUser } from "@/lib/require-auth";
import { enforceRateLimit } from "@/lib/security";
import { getClientIp } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const rateLimited = enforceRateLimit(req, "documents-get", 40, 60_000);
  if (rateLimited) return rateLimited;

  const user = await getAuthorizedUser(req);
  if (!user) return unauthorized();

  const db = getDb();
  const { id } = params;
  await ensureDefaultPlaybookDocument();
  const document = await db.query.documents.findFirst({
    where: and(
      eq(schema.documents.isActive, true),
      or(eq(schema.documents.id, id), eq(schema.documents.slug, id)),
    ),
  });

  const resolved = document ?? (await getDocumentBySlug(id));
  if (!resolved) return forbidden("Document not found");

  const absolutePath = path.join(process.cwd(), resolved.filePath);

  try {
    const fileBuffer = await fs.readFile(absolutePath);
    await logDocumentAccess({
      userId: user.userId,
      documentId: resolved.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || "",
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": resolved.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path.basename(resolved.filePath)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Document read error:", err);
    return forbidden("Document unavailable");
  }
}
