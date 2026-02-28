const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRIPE_SESSION_REGEX = /^cs_(test|live)_[A-Za-z0-9_]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isValidPlan(value: string): value is "monthly" | "lifetime" {
  return value === "monthly" || value === "lifetime";
}

export function isValidStripeSessionId(value: string): boolean {
  return STRIPE_SESSION_REGEX.test(value);
}

export function clampString(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength);
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
