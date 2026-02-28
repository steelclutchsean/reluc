# Architecture

This document explains how the different parts of the app connect, how data flows through the system, and the key design decisions.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│  │ Landing  │   │ Success  │   │Dashboard │                │
│  │ page.tsx │   │ page.tsx │   │ page.tsx │                │
│  │          │   │          │   │          │                │
│  │ - Hero   │   │ - Verify │   │ - Email  │                │
│  │ - Pricing│   │   payment│   │   gen    │                │
│  │ - Checkout│  │ - Set    │   │ - Playbook│               │
│  │   buttons│   │   cookie │   │   download│               │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                │
│       │              │              │                        │
└───────┼──────────────┼──────────────┼────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                         │
│                   (Server-side, port 3000)                    │
│                                                              │
│  POST /api/checkout ──────────► Stripe Checkout Session      │
│  POST /api/crypto-checkout ──► Coinbase Commerce Charge      │
│  POST /api/verify ────────────► Stripe Session Retrieve      │
│  GET  /api/verify/check ──────► JWT Verify + Stripe Sub Check│
│  POST /api/generate ──────────► Anthropic Claude API         │
│  POST /api/webhook ───────────► Stripe Webhook Verify        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    STRIPE    │ │   COINBASE   │ │  ANTHROPIC   │
│   Payments   │ │   Commerce   │ │  Claude API  │
│   Subs mgmt  │ │   Crypto pay │ │  Email gen   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Payment Flow (Stripe)

This is the most important flow in the app. Here's exactly what happens step by step:

```
User clicks "Get Lifetime Access" ($88)
        │
        ▼
page.tsx: handleCheckout("stripe")
        │
        ├── Fires Meta Pixel "InitiateCheckout" event (if pixel configured)
        │
        ▼
POST /api/checkout  { email: "...", plan: "lifetime" }
        │
        ├── Reads STRIPE_SECRET_KEY, STRIPE_LIFETIME_PRICE_ID from env
        ├── Creates Stripe checkout session (mode: "payment" for lifetime)
        │   - success_url: https://reluctant.work/success?session_id={CHECKOUT_SESSION_ID}
        │   - cancel_url: https://reluctant.work/#pricing
        │
        ▼
Returns { url: "https://checkout.stripe.com/..." }
        │
        ▼
Browser redirects to Stripe's hosted checkout page
        │
        ├── User enters card / selects PayPal / Venmo
        ├── Stripe processes payment
        │
        ▼
Stripe redirects to /success?session_id=cs_test_abc123
        │
        ▼
success/page.tsx loads
        │
        ├── Extracts session_id from URL params
        │
        ▼
POST /api/verify  { sessionId: "cs_test_abc123" }
        │
        ├── Calls stripe.checkout.sessions.retrieve()
        ├── Checks payment_status === "paid"
        ├── Determines lifetime vs monthly (session.mode)
        ├── Creates JWT with { customerId, email, paid: true, lifetime: true }
        ├── Signs JWT with JWT_SECRET
        ├── Sets HTTP-only cookie "rs_token" (expires: 10 years for lifetime)
        │
        ▼
Returns { success: true, email: "..." }
        │
        ├── Fires Meta Pixel "Purchase" event (if pixel configured)
        │
        ▼
setTimeout → redirect to /dashboard (after 2.5 seconds)
```

### Monthly vs Lifetime Differences

| Aspect | Monthly ($13/mo) | Lifetime ($88) |
|--------|-----------------|----------------|
| Stripe checkout mode | `subscription` | `payment` |
| JWT `lifetime` field | `false` | `true` |
| JWT expiration | 30 days | ~10 years (3650 days) |
| Cookie max-age | 30 days | 10 years |
| Subscription check on dashboard load | Yes — queries Stripe for active sub | No — JWT alone is sufficient |

---

## Authentication Flow

The app uses stateless JWT auth with no database.

### Token Creation (after payment)

```
POST /api/verify
        │
        ▼
JWT payload:
{
  customerId: "cus_abc123",      // Stripe customer ID
  email: "user@example.com",
  paid: true,
  lifetime: true/false
}
        │
        ├── Signed with HS256 using JWT_SECRET
        │
        ▼
Set as cookie:
  Name:     rs_token
  HttpOnly: true                 // JavaScript can't read it
  Secure:   true (in production) // HTTPS only
  SameSite: lax
  Path:     /
  MaxAge:   depends on plan
```

### Token Verification (on dashboard load)

```
GET /api/verify/check
        │
        ├── Extract rs_token from Cookie header
        ├── Verify JWT signature with JWT_SECRET
        │
        ├── IF lifetime: true
        │   └── Return { authorized: true } ✓
        │
        ├── IF NOT lifetime:
        │   ├── Call stripe.subscriptions.list({ customer: customerId, status: 'active' })
        │   ├── IF active subscription found:
        │   │   └── Return { authorized: true } ✓
        │   └── IF no active subscription:
        │       └── Return { authorized: false, reason: 'subscription_inactive' } ✗
        │
        └── IF no cookie or invalid JWT:
            └── Return { authorized: false } ✗
```

### Token Usage (for AI email generation)

```
POST /api/generate
        │
        ├── Extract rs_token from Cookie header
        ├── Verify JWT signature
        ├── IF invalid → 401 Unauthorized
        ├── IF valid → proceed with Claude API call
```

### Known Limitations

- **No token refresh** — if a monthly user's JWT expires after 30 days, they need to go through Stripe again to get a new one. There's no "re-login" flow.
- **No token revocation** — if you need to revoke someone's access immediately, you'd need to change `JWT_SECRET` (which invalidates ALL tokens for ALL users).
- **Cookie-based** — if a user clears their browser cookies, they lose access. There's no "forgot password" or re-authentication flow.
- **No user accounts** — users can't "log in" in the traditional sense. Auth is entirely payment-based.

---

## AI Email Generation Flow

```
Dashboard: User pastes email + optional context, clicks "Generate"
        │
        ▼
POST /api/generate  { email: "original email text...", context: "optional context..." }
        │
        ├── Verify JWT (must be authenticated)
        ├── Validate email text is ≥ 10 characters
        │
        ▼
Call Anthropic API:
  - Model: claude-sonnet-4-20250514
  - Max tokens: 4096
  - System prompt: Defines "reluctant seller" philosophy, specifies JSON output format
  - User prompt: "Rewrite the following email..." + optional context
        │
        ▼
Parse response:
  - Try JSON.parse() on the full response
  - If that fails, use regex to extract JSON from markdown code blocks
  - Expected format: { versions: [ { label, tone, subject, body }, ... ] }
        │
        ▼
Return 3 email versions to the dashboard
```

### System Prompt (what Claude is told)

The system prompt instructs Claude to act as "The Reluctant Seller" and produce 3 versions:

1. **The Curious Peer** — casual, treats recipient as equal
2. **The Reluctant Expert** — knowledgeable but hesitant to sell
3. **The Generous Observer** — gives value first, makes saying no easy

Core principles enforced in the prompt:
- Email should feel like a gift, not an invoice
- Never pitch directly — share insight, create curiosity
- Position as peer, not vendor
- Make it easy to say no
- Shorter is better

---

## Static Files

Two files are served directly from the `public/` folder:

| File | URL | Description |
|------|-----|-------------|
| `The_Reluctant_Seller.pdf` | `/The_Reluctant_Seller.pdf` | 20-page playbook, downloadable by paid members |
| `simulator.html` | `/simulator.html` | Free interactive simulator, standalone HTML |

**Note:** These files are publicly accessible — there's no auth check on static files. The playbook download link is only shown on the dashboard, but anyone with the direct URL could access it. If you need to protect the PDF, you'd need to serve it through an API route with auth checking.

---

## CSS Architecture

The app uses a combination of Tailwind CSS utility classes and custom CSS defined in `globals.css`.

### Custom CSS Classes

| Class | What It Does |
|-------|-------------|
| `ambient-bg` | Fixed-position animated gradient background with soft color blobs |
| `glass-card` | Frosted glass card effect: semi-transparent white, blur, saturation, subtle border + shadow |
| `glass-dark` | Dark variant: navy blue background with glass effect |
| `btn-pill` | Pill-shaped button: rounded-full, padding, font settings |
| `spring-hover` | Cubic-bezier scale animation on hover (1.03x) and active (0.97x) |
| `animate-fade-in` | Fade in + slide up animation (0.6s) |
| `animate-fade-in-delay` | Same but delayed by 0.15s |
| `animate-fade-in-delay-2` | Same but delayed by 0.3s |

### Brand Colors (defined in tailwind.config.ts)

| Name | Hex | Usage |
|------|-----|-------|
| `brand-gold` | `#B8963E` | Lifetime pricing, paid badges, quotes |
| `brand-navy` | `#1B2A4A` | Dark glass background |

### Color Variables (defined in globals.css)

| Variable | Hex | Usage |
|----------|-----|-------|
| `--brand-gold` | `#B8963E` | Same as above |
| `--brand-navy` | `#1B2A4A` | Same as above |
| `--system-bg` | `#F2F2F7` | Page background (iOS-style light gray) |

---

## Component Relationships

```
layout.tsx
├── Wraps ALL pages
├── Sets <html>, <head>, <body>
├── Loads Google Fonts (Inter)
├── Injects Meta Pixel (conditional on env var)
├── Sets background color and ambient-bg div
│
├── page.tsx (Landing — /)
│   ├── Uses Logo component
│   ├── Calls POST /api/checkout (Stripe)
│   ├── Calls POST /api/crypto-checkout (Coinbase)
│   ├── Local state: email, plan selection, loading
│   └── Links to: /simulator.html, /dashboard, #pricing
│
├── success/page.tsx (/success)
│   ├── Uses Logo component
│   ├── Reads ?session_id= from URL
│   ├── Calls POST /api/verify
│   ├── On success → redirects to /dashboard after 2.5s
│   └── On error → shows error + links to /dashboard and /
│
└── dashboard/page.tsx (/dashboard)
    ├── Uses Logo component
    ├── Calls GET /api/verify/check (on mount)
    ├── If not authorized → shows "Access Required" + link to /#pricing
    ├── If authorized → shows tabbed interface:
    │   ├── Tab "Email Generator":
    │   │   ├── Textarea for email input
    │   │   ├── Textarea for optional context
    │   │   ├── Calls POST /api/generate
    │   │   └── Renders 3 version cards with copy buttons
    │   └── Tab "Playbook":
    │       ├── Download link to /The_Reluctant_Seller.pdf
    │       └── Link to /simulator.html
    └── Footer with Stripe billing portal link
```

---

## Production Infrastructure

```
Internet
    │
    ▼
GoDaddy DNS (reluctant.work → 147.93.36.169)
    │
    ▼
Hostinger VPS (Ubuntu 22.04)
    │
    ├── UFW Firewall (ports 22, 80, 443 open)
    ├── Fail2Ban (SSH brute-force protection)
    │
    ▼
Nginx (port 80/443)
    │
    ├── SSL termination (Let's Encrypt via Certbot)
    ├── Security headers (HSTS, CSP, X-Frame-Options, etc.)
    ├── Rate limiting:
    │   ├── /api/checkout, /api/crypto-checkout: 2 req/sec, burst 5
    │   └── /api/*: 10 req/sec, burst 20
    ├── Reverse proxy to localhost:3000
    │
    ▼
PM2 Process Manager
    │
    ├── Keeps Next.js running after SSH disconnect
    ├── Auto-restarts on crash
    ├── Auto-starts on server reboot (via pm2 startup)
    │
    ▼
Next.js Production Server (port 3000)
    │
    ├── Serves pre-built React pages
    ├── Handles API routes
    └── Serves static files from /public
```
