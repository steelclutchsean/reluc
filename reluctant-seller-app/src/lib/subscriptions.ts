import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb, schema } from "@/db";

type UpsertUserInput = {
  email: string;
  stripeCustomerId?: string | null;
};

export async function upsertUserByEmail(input: UpsertUserInput) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existing) {
    if (input.stripeCustomerId && existing.stripeCustomerId !== input.stripeCustomerId) {
      await db
        .update(schema.users)
        .set({
          stripeCustomerId: input.stripeCustomerId,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, existing.id));
      return { ...existing, stripeCustomerId: input.stripeCustomerId };
    }
    return existing;
  }

  const user = {
    id: randomUUID(),
    email,
    stripeCustomerId: input.stripeCustomerId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(schema.users).values(user);
  return user;
}

export async function setStripeSubscriptionState(args: {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: "monthly" | "lifetime";
  currentPeriodEnd?: Date | null;
}) {
  const db = getDb();
  const existing = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.stripeSubscriptionId, args.stripeSubscriptionId),
  });

  if (existing) {
    await db
      .update(schema.subscriptions)
      .set({
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, existing.id));
    return;
  }

  await db.insert(schema.subscriptions).values({
    id: randomUUID(),
    userId: args.userId,
    stripeSubscriptionId: args.stripeSubscriptionId,
    provider: "stripe",
    planType: args.planType,
    status: args.status,
    currentPeriodEnd: args.currentPeriodEnd ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = getDb();
  return db.query.users.findFirst({
    where: eq(schema.users.stripeCustomerId, stripeCustomerId),
  });
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  return db.query.users.findFirst({
    where: eq(schema.users.email, email.trim().toLowerCase()),
  });
}

export async function updateStripeSubscriptionStatus(args: {
  stripeSubscriptionId: string;
  status: string;
  currentPeriodEnd?: Date | null;
}) {
  const db = getDb();
  await db
    .update(schema.subscriptions)
    .set({
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.subscriptions.stripeSubscriptionId, args.stripeSubscriptionId));
}

export async function setCoinbaseSubscriptionState(args: {
  userId: string;
  status: string;
  planType: "monthly" | "lifetime";
}) {
  const db = getDb();
  await db.insert(schema.subscriptions).values({
    id: randomUUID(),
    userId: args.userId,
    provider: "coinbase",
    planType: args.planType,
    status: args.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function hasActiveEntitlement(userId: string, isLifetimeToken?: boolean): Promise<boolean> {
  const db = getDb();
  if (isLifetimeToken) {
    const lifetime = await db.query.subscriptions.findFirst({
      where: and(
        eq(schema.subscriptions.userId, userId),
        eq(schema.subscriptions.planType, "lifetime"),
        inArray(schema.subscriptions.status, ["paid", "active"]),
      ),
      orderBy: [desc(schema.subscriptions.updatedAt)],
    });
    if (lifetime) return true;
  }

  const active = await db.query.subscriptions.findFirst({
    where: and(
      eq(schema.subscriptions.userId, userId),
      inArray(schema.subscriptions.status, ["active", "paid"]),
      or(
        isNull(schema.subscriptions.currentPeriodEnd),
        eq(schema.subscriptions.planType, "lifetime"),
      ),
    ),
    orderBy: [desc(schema.subscriptions.updatedAt)],
  });

  return Boolean(active);
}

export async function markWebhookProcessed(provider: string, eventId: string) {
  const db = getDb();
  const exists = await db.query.webhookEvents.findFirst({
    where: and(eq(schema.webhookEvents.provider, provider), eq(schema.webhookEvents.id, eventId)),
  });
  if (exists) return false;

  await db.insert(schema.webhookEvents).values({
    id: eventId,
    provider,
    receivedAt: new Date(),
  });
  return true;
}
