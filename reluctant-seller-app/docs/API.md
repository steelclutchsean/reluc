# API Reference

All API routes live in `src/app/api/`. They use the Next.js 14 App Router convention where each `route.ts` file exports named HTTP method functions (`POST`, `GET`, etc.).

The app runs on port **3000** by default. In production, Nginx proxies requests from port 80/443 to 3000.

---

## POST `/api/checkout`

**Purpose:** Creates a Stripe checkout session and returns the hosted checkout URL.

**Auth required:** No

**File:** `src/app/api/checkout/route.ts`

### Request Body

```json
{
  "email": "user@example.com",
  "plan": "lifetime"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | No | Pre-fills email on Stripe checkout page. If omitted, Stripe asks for it. |
| `plan` | `"monthly"` or `"lifetime"` | Yes | Determines which Stripe Price ID to use and whether checkout mode is `subscription` or `payment`. |

### How It Works

1. Reads `STRIPE_SECRET_KEY` from env to initialize the Stripe client.
2. If `plan` is `"lifetime"`, uses `STRIPE_LIFETIME_PRICE_ID` and sets mode to `payment` (one-time).
3. If `plan` is `"monthly"`, uses `STRIPE_PRICE_ID` and sets mode to `subscription` (recurring).
4. Creates a Stripe checkout session with:
   - `payment_method_types: ['card']` (PayPal/Venmo are enabled via Stripe Dashboard settings, not code)
   - `success_url` pointing to `/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url` pointing to `/#pricing`
   - `allow_promotion_codes: true`
5. Returns the session URL.

### Response

**Success (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Error (500):**
```json
{
  "error": "No such price: 'price_placeholder_monthly'"
}
```

### Common Errors

- `"No such price"` — The `STRIPE_PRICE_ID` or `STRIPE_LIFETIME_PRICE_ID` in `.env` is wrong or doesn't exist in your Stripe account.
- `"Invalid API Key"` — The `STRIPE_SECRET_KEY` is wrong or you're mixing test/live keys.

---

## POST `/api/crypto-checkout`

**Purpose:** Creates a Coinbase Commerce charge and returns the hosted checkout URL.

**Auth required:** No

**File:** `src/app/api/crypto-checkout/route.ts`

### Request Body

```json
{
  "email": "user@example.com",
  "plan": "lifetime"
}
```

Same fields as `/api/checkout`.

### How It Works

1. Reads `COINBASE_COMMERCE_API_KEY` from env.
2. Calls `POST https://api.commerce.coinbase.com/charges` with:
   - Fixed price of $88 (lifetime) or $13 (monthly)
   - Metadata containing email and plan
   - Redirect URL pointing to `/success?crypto=true`
3. Returns the hosted checkout URL.

### Response

**Success (200):**
```json
{
  "url": "https://commerce.coinbase.com/charges/XXXXXXXX"
}
```

**Error (500):**
```json
{
  "error": "Failed to create crypto charge"
}
```

### Note

Crypto payments don't automatically create JWT auth tokens (unlike Stripe). The `/success` page handles crypto differently — it shows a success message but the user may need manual verification. This is a known limitation.

---

## POST `/api/verify`

**Purpose:** After a successful Stripe payment, this endpoint verifies the payment and issues a JWT auth cookie.

**Auth required:** No (called from the success page after redirect from Stripe)

**File:** `src/app/api/verify/route.ts`

### Request Body

```json
{
  "sessionId": "cs_test_a1b2c3d4..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | The Stripe checkout session ID from the URL parameter `?session_id=` |

### How It Works

1. Calls `stripe.checkout.sessions.retrieve(sessionId)` with expanded subscription and customer data.
2. Checks that `payment_status === 'paid'`.
3. Determines if it's a lifetime purchase (`session.mode === 'payment'`) or monthly subscription.
4. Creates a JWT token containing:
   - `customerId` — Stripe customer ID
   - `email` — Customer's email
   - `paid: true`
   - `lifetime: true/false`
   - Expiration: 10 years for lifetime, 30 days for monthly
5. Sets the JWT as an HTTP-only cookie named `rs_token`.

### Response

**Success (200):**
```json
{
  "success": true,
  "email": "user@example.com"
}
```

Also sets cookie: `rs_token=eyJhbG...` (httpOnly, secure in production, sameSite lax)

**Error (400):**
```json
{
  "error": "Missing session ID"
}
```

**Error (403):**
```json
{
  "error": "Payment not completed"
}
```

---

## GET `/api/verify/check`

**Purpose:** Checks if the current user has a valid auth token and an active subscription.

**Auth required:** Yes (reads `rs_token` cookie)

**File:** `src/app/api/verify/check/route.ts`

### Request

No body. Reads the `rs_token` cookie from the request headers.

### How It Works

1. Extracts `rs_token` from the `Cookie` header using regex.
2. Verifies the JWT signature using `JWT_SECRET`.
3. If the token has `lifetime: true`, the user is authorized (no further checks).
4. If the token has a `customerId`, calls `stripe.subscriptions.list()` to verify there's an active subscription.
5. Returns authorization status.

### Response

**Authorized (200):**
```json
{
  "authorized": true,
  "authenticated": true,
  "email": "user@example.com"
}
```

**No cookie / invalid token (401):**
```json
{
  "authorized": false,
  "authenticated": false
}
```

**Subscription expired (403):**
```json
{
  "authorized": false,
  "authenticated": false,
  "reason": "subscription_inactive"
}
```

### Called By

The dashboard page (`/dashboard`) calls this endpoint on load to decide whether to show the dashboard or the "Access Required" screen.

---

## POST `/api/generate`

**Purpose:** Takes a sales email and returns 3 "reluctant seller" rewrites generated by Claude AI.

**Auth required:** Yes (reads `rs_token` cookie)

**File:** `src/app/api/generate/route.ts`

### Request Body

```json
{
  "email": "Hi John, I wanted to follow up on our conversation about...",
  "context": "John is the CTO of a mid-size SaaS company. We sell data analytics tools."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | The sales email to rewrite. Must be at least 10 characters. |
| `context` | string | No | Additional context about the recipient, product, company, or relationship. |

### How It Works

1. Verifies the JWT from the `rs_token` cookie.
2. Validates that `email` is at least 10 characters.
3. Calls the Anthropic API with:
   - Model: `claude-sonnet-4-20250514`
   - Max tokens: 4096
   - System prompt defining the "reluctant seller" philosophy and JSON output format
   - User prompt containing the email to rewrite + optional context
4. Parses the JSON response (with fallback regex extraction if the model wraps it in markdown).
5. Returns 3 email versions.

### Response

**Success (200):**
```json
{
  "versions": [
    {
      "label": "The Curious Peer",
      "tone": "Casual, genuinely curious, treats them as an equal",
      "subject": "Quick thought on your analytics setup",
      "body": "Hey John,\n\nWas reading about..."
    },
    {
      "label": "The Reluctant Expert",
      "tone": "Knowledgeable but hesitant to sell, shares insight freely",
      "subject": "Something I noticed (not sure if this is useful)",
      "body": "John,\n\nI might be completely off base here..."
    },
    {
      "label": "The Generous Observer",
      "tone": "Gives value first, makes saying no easy",
      "subject": "No response needed — just sharing this",
      "body": "Hi John,\n\nI put together a quick..."
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Bad input (400):**
```json
{
  "error": "Please provide an email to rewrite"
}
```

### Cost

Each generation call costs approximately $0.01–$0.03 in Anthropic API credits, depending on input/output length.

---

## POST `/api/webhook`

**Purpose:** Receives Stripe webhook events for payment lifecycle tracking.

**Auth required:** No (verified via Stripe webhook signature)

**File:** `src/app/api/webhook/route.ts`

### How It Works

1. Reads the raw request body and the `stripe-signature` header.
2. Calls `stripe.webhooks.constructEvent()` using `STRIPE_WEBHOOK_SECRET` to verify the signature.
3. Handles two event types:
   - `checkout.session.completed` — Logs the customer email (currently just console.log).
   - `customer.subscription.deleted` — Logs the subscription ID (currently just console.log).
4. Returns `{ received: true }`.

### Important Notes

- This endpoint currently only **logs** events. It does NOT update any database or revoke access — because there's no database.
- Access revocation for cancelled subscriptions happens in real-time via `/api/verify/check`, which queries Stripe's subscription status directly.
- The webhook is still important for Stripe's retry logic and for future enhancements (e.g., sending cancellation emails).

### Stripe Webhook Setup

In the Stripe Dashboard:
1. Go to **Developers** > **Webhooks** > **Add endpoint**
2. URL: `https://reluctant.work/api/webhook`
3. Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`) into your `.env` as `STRIPE_WEBHOOK_SECRET`
