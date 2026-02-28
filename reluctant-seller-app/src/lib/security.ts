import { NextResponse } from "next/server";
import { getClientIp } from "./validation";

type Bucket = { count: number; resetAt: number };

const memoryRateLimitStore = new Map<string, Bucket>();

export function enforceRateLimit(
  req: Request,
  keyPrefix: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(req);
  const now = Date.now();
  const key = `${keyPrefix}:${ip}`;
  const bucket = memoryRateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    memoryRateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  bucket.count += 1;
  return null;
}

export function enforceOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return null;

  try {
    const parsed = new URL(origin);
    if (parsed.host !== host) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  return null;
}

export async function withTimeout<T>(
  promiseFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}
