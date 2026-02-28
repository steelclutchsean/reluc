import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ensureDefaultPlaybookDocument } from "@/lib/documents";
import { unauthorized } from "@/lib/errors";
import { getAuthorizedUser } from "@/lib/require-auth";
import { enforceRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  const rateLimited = enforceRateLimit(req, "documents-list", 50, 60_000);
  if (rateLimited) return rateLimited;

  const user = await getAuthorizedUser(req);
  if (!user) return unauthorized();

  const db = getDb();
  await ensureDefaultPlaybookDocument();
  const documents = await db.query.documents.findMany({
    where: eq(schema.documents.isActive, true),
    columns: {
      id: true,
      slug: true,
      title: true,
      mimeType: true,
    },
  });

  return NextResponse.json({ documents });
}
