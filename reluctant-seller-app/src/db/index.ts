import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;
let dbInstance: DbInstance | null = null;

export function getDb(): DbInstance {
  if (dbInstance) return dbInstance;
  const queryClient = postgres(getEnv("DATABASE_URL"), {
    max: 5,
    prepare: true,
  });
  dbInstance = drizzle(queryClient, { schema });
  return dbInstance;
}

export { schema };
