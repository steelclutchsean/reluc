import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export async function ensureDefaultPlaybookDocument() {
  const db = getDb();
  const existing = await db.query.documents.findFirst({
    where: eq(schema.documents.slug, "reluctant-seller-playbook"),
  });
  if (existing) return existing;

  const document = {
    id: randomUUID(),
    slug: "reluctant-seller-playbook",
    title: "The Reluctant Seller Playbook",
    filePath: "private-assets/The_Reluctant_Seller.pdf",
    mimeType: "application/pdf",
    isPaywalled: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(schema.documents).values(document);
  return document;
}

export async function getDocumentBySlug(slug: string) {
  const db = getDb();
  return db.query.documents.findFirst({
    where: eq(schema.documents.slug, slug),
  });
}

export async function logDocumentAccess(input: {
  userId: string;
  documentId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = getDb();
  await db.insert(schema.accessLogs).values({
    id: randomUUID(),
    userId: input.userId,
    documentId: input.documentId,
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    createdAt: new Date(),
  });
}
