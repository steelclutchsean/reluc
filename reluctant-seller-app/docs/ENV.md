# Environment Variables Reference

All environment variables are defined in the `.env` file in the root of `reluctant-seller-app/`. A template is provided at `.env.example`.

**Critical:** The app does NOT validate environment variables at startup. If a key is missing or wrong, the corresponding feature will fail silently at runtime (usually returning a 500 error to the browser).

---

## Stripe Variables

### `STRIPE_SECRET_KEY`

- **Format:** `sk_test_...` (test mode) or `sk_live_...` (production)
- **Where to get it:** [Stripe Dashboard](https://dashboard.stripe.com) > Developers > API keys > Secret key
- **Used by:** `api/checkout`, `api/verify`, `api/verify/check`, `api/webhook`
- **What happens if missing:** All payment flows break. Checkout returns 500, verification fails.

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- **Format:** `pk_test_...` (test mode) or `pk_live_...` (production)
- **Where to get it:** Same place as secret key, but it's the "Publishable key"
- **Used by:** Currently referenced in `.env.example` but **not actually used in the code**. Stripe.js is not loaded client-side in this app — all Stripe interactions happen server-side via the checkout API. Included for completeness/future use.
- **What happens if missing:** Nothing breaks currently.

### `STRIPE_WEBHOOK_SECRET`

- **Format:** `whsec_...`
- **Where to get it:** Stripe Dashboard > Developers > Webhooks > select your endpoint > Signing secret
- **Used by:** `api/webhook` — verifies that incoming webhook requests are actually from Stripe
- **What happens if missing:** Webhook endpoint returns 400 "Invalid signature" for every event. Stripe will keep retrying and eventually disable the endpoint.

### `STRIPE_PRICE_ID`

- **Format:** `price_...`
- **Where to get it:** Stripe Dashboard > Products > select your product > find the **monthly recurring** price > copy the Price ID
- **Used by:** `api/checkout` when `plan === "monthly"`
- **What happens if missing:** Monthly checkout returns 500 error "No such price".

### `STRIPE_LIFETIME_PRICE_ID`

- **Format:** `price_...`
- **Where to get it:** Same product page > find the **one-time** price > copy the Price ID
- **Used by:** `api/checkout` when `plan === "lifetime"`
- **What happens if missing:** Lifetime checkout returns 500 error "No such price".

---

## Anthropic (Claude AI) Variables

### `ANTHROPIC_API_KEY`

- **Format:** `sk-ant-...`
- **Where to get it:** [Anthropic Console](https://console.anthropic.com) > API Keys > Create key
- **Used by:** `api/generate` — powers the email rewriting feature
- **What happens if missing:** Email generator returns 500 error. Dashboard still loads but the "Generate" button fails.
- **Cost:** Each generation costs ~$0.01–$0.03 depending on email length. You need credits in your Anthropic account.

---

## Coinbase Commerce Variables

### `COINBASE_COMMERCE_API_KEY`

- **Format:** A long alphanumeric string (no prefix)
- **Where to get it:** [Coinbase Commerce](https://commerce.coinbase.com) > Settings > API Keys > Create API key
- **Used by:** `api/crypto-checkout`
- **What happens if missing:** The "Pay with Bitcoin / Crypto" button returns a 500 error. Everything else works fine.
- **Optional?:** Yes. If you don't want crypto payments, you can leave this blank and optionally remove the crypto button from `page.tsx`.

---

## App Configuration Variables

### `NEXT_PUBLIC_APP_URL`

- **Format:** Full URL with protocol, no trailing slash. Examples: `http://localhost:3000`, `https://reluctant.work`
- **Used by:** `api/checkout` and `api/crypto-checkout` — constructs the `success_url` and `cancel_url` for payment redirects
- **What happens if missing:** Falls back to `http://localhost:3000`. In production, this means Stripe redirects users back to localhost (which won't work).
- **Critical for production:** Must be set to your actual domain.

### `JWT_SECRET`

- **Format:** Any string. Should be at least 32 characters for security. Generate one with: `openssl rand -hex 32`
- **Used by:** `api/verify` (signs JWTs), `api/verify/check` (verifies JWTs), `api/generate` (verifies JWTs)
- **What happens if missing:** Falls back to `'dev-secret-change-me-in-production'` (hardcoded default). This is insecure — anyone who reads the source code can forge auth tokens.
- **Critical for production:** Must be a unique, random, secret string.

### `NEXT_PUBLIC_META_PIXEL_ID`

- **Format:** A numeric string, e.g., `123456789012345`
- **Where to get it:** [Meta Events Manager](https://business.facebook.com/events_manager) > select your Pixel > copy the ID
- **Used by:** `layout.tsx` — injects the Meta Pixel tracking script into the page `<head>`
- **What happens if missing:** Meta Pixel script is not injected at all (the code checks `process.env.NEXT_PUBLIC_META_PIXEL_ID` before rendering). No tracking, no errors.
- **Optional?:** Yes. Only needed if you're running Meta/Facebook/Instagram ads.

---

## Variable Naming Convention

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (client-side JavaScript can read them). All other variables are server-only and never sent to the client.

| Prefix | Visibility | Example |
|--------|-----------|---------|
| `NEXT_PUBLIC_` | Client + Server | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| No prefix | Server only | `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `JWT_SECRET` |

**Security rule:** Never put secret keys (Stripe secret, Anthropic key, JWT secret) in `NEXT_PUBLIC_` variables. They would be visible in the browser's JavaScript bundle.

---

## Example .env for Local Development

```bash
# Stripe TEST mode keys
STRIPE_SECRET_KEY=sk_test_51ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_abc123...
STRIPE_PRICE_ID=price_1ABC...
STRIPE_LIFETIME_PRICE_ID=price_1DEF...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-abc123...

# Coinbase (optional)
COINBASE_COMMERCE_API_KEY=abc123def456

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4

# Meta Pixel (optional)
# NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

## Example .env for Production

```bash
# Stripe LIVE mode keys
STRIPE_SECRET_KEY=sk_live_51ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_xyz789...
STRIPE_PRICE_ID=price_1GHI...
STRIPE_LIFETIME_PRICE_ID=price_1JKL...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-abc123...

# Coinbase
COINBASE_COMMERCE_API_KEY=abc123def456

# App — use your real domain
NEXT_PUBLIC_APP_URL=https://reluctant.work
JWT_SECRET=use_openssl_rand_hex_32_to_generate_this

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```
