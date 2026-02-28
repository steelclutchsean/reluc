import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    stripeCustomerUnique: uniqueIndex("users_stripe_customer_unique").on(table.stripeCustomerId),
  }),
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    provider: varchar("provider", { length: 32 }).notNull().default("stripe"),
    planType: varchar("plan_type", { length: 32 }).notNull(), // monthly | lifetime
    status: varchar("status", { length: 64 }).notNull(), // active, canceled, paid, pending
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    stripeSubUnique: uniqueIndex("subscriptions_stripe_sub_unique").on(table.stripeSubscriptionId),
  }),
);

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull().default("application/pdf"),
  fileSizeBytes: integer("file_size_bytes"),
  isPaywalled: boolean("is_paywalled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accessLogs = pgTable("access_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  documentId: text("document_id").references(() => documents.id, { onDelete: "set null" }),
  ipAddress: varchar("ip_address", { length: 128 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    providerEventUnique: uniqueIndex("webhook_events_provider_id_unique").on(table.provider, table.id),
  }),
);
