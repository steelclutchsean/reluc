const REQUIRED_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_LIFETIME_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
  "COINBASE_COMMERCE_API_KEY",
  "COINBASE_WEBHOOK_SHARED_SECRET",
  "ANTHROPIC_API_KEY",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export function getEnv(key: RequiredEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function assertRequiredEnv(): void {
  for (const key of REQUIRED_ENV_KEYS) {
    getEnv(key);
  }
}
