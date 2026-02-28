# The Reluctant Seller

A Next.js 14 web application for "The Reluctant Seller" — a sales philosophy platform with a free interactive simulator, a paid 20-page playbook (PDF), and an AI-powered email rewriting tool powered by Claude.

**Live URL:** `https://reluctant.work`
**VPS IP:** `147.93.36.169`
**Domain DNS:** GoDaddy

---

## What This App Does

This is a **paid product website** with three core components:

1. **Landing Page** (`/`) — Marketing page with pricing (monthly $13/mo or lifetime $88), checkout buttons for Stripe (card/PayPal/Venmo) and Coinbase Commerce (crypto).
2. **Dashboard** (`/dashboard`) — Members-only area with two tabs:
   - **Email Generator** — Paste any sales email, optionally add context, and get 3 AI-generated "reluctant seller" rewrites powered by Claude (Anthropic API).
   - **Playbook** — Download link for the 20-page PDF guide.
3. **Interactive Simulator** (`/simulator.html`) — Free standalone HTML tool with 5 sales scenarios, served as a static file.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + custom CSS (glassmorphism, ambient backgrounds) |
| Payments | [Stripe](https://stripe.com/) (cards, PayPal, Venmo) + [Coinbase Commerce](https://commerce.coinbase.com/) (crypto) |
| AI | [Anthropic Claude API](https://docs.anthropic.com/) (`claude-sonnet-4-20250514`) |
| Auth | JWT tokens via `jose` library, stored in HTTP-only cookies |
| Process Manager | PM2 (production) |
| Reverse Proxy | Nginx with rate limiting + security headers |
| Hosting | Hostinger VPS (Ubuntu 22.04) |

---

## Project Structure

```
reluctant-seller-app/
├── src/
│   └── app/
│       ├── layout.tsx            # Root HTML layout, Google Fonts, Meta Pixel
│       ├── page.tsx              # Landing page (hero, pricing, checkout)
│       ├── globals.css           # Tailwind directives + custom glass/ambient CSS
│       ├── logo.tsx              # SVG money-tree logo component
│       ├── dashboard/
│       │   └── page.tsx          # Members-only dashboard (email gen + playbook)
│       ├── success/
│       │   └── page.tsx          # Post-payment verification + redirect to dashboard
│       └── api/
│           ├── checkout/
│           │   └── route.ts      # POST — Creates Stripe checkout session
│           ├── crypto-checkout/
│           │   └── route.ts      # POST — Creates Coinbase Commerce charge
│           ├── generate/
│           │   └── route.ts      # POST — AI email rewrite (requires JWT auth)
│           ├── verify/
│           │   ├── route.ts      # POST — Verifies Stripe payment, issues JWT cookie
│           │   └── check/
│           │       └── route.ts  # GET — Checks if user has valid JWT + active subscription
│           └── webhook/
│               └── route.ts      # POST — Stripe webhook (checkout.session.completed, subscription.deleted)
├── public/
│   ├── The_Reluctant_Seller.pdf  # Downloadable playbook for paid members
│   └── simulator.html            # Free interactive sales simulator
├── deploy/
│   ├── ONE-COMMAND-DEPLOY.sh     # Full automated VPS setup (Node, Nginx, SSL, PM2)
│   ├── setup-vps.sh              # System packages + firewall + Fail2Ban
│   ├── configure-nginx.sh        # Nginx reverse proxy + Let's Encrypt SSL
│   └── start-app.sh              # npm install + build + PM2 start
├── docs/
│   ├── ENV.md                    # Every environment variable explained
│   ├── API.md                    # All API endpoints with request/response details
│   ├── ARCHITECTURE.md           # How components connect, auth flow, data flow
│   ├── DEPLOYMENT.md             # Full VPS deployment walkthrough
│   └── TROUBLESHOOTING.md        # Common issues and fixes
├── .env.example                  # Template for environment variables
├── package.json                  # Dependencies and npm scripts
├── tailwind.config.ts            # Tailwind config with brand colors
├── next.config.mjs               # Next.js config (currently default/empty)
├── tsconfig.json                 # TypeScript config
└── postcss.config.mjs            # PostCSS config for Tailwind processing
```

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js 18+** — check with `node --version`
- **npm** — comes with Node.js
- API keys for Stripe, Anthropic, and optionally Coinbase Commerce

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/steelclutchsean/reluc.git
cd reluc/reluctant-seller-app

# 2. Install dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env

# 4. Edit .env with your real API keys (see docs/ENV.md for what each one does)
#    On Mac/Linux: nano .env
#    On Windows: notepad .env
#    Or open in Cursor/VS Code

# 5. Run the development server
npm run dev
```

The app will be running at **http://localhost:3000**.

### npm Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Starts dev server with hot reload at http://localhost:3000 |
| `npm run build` | Compiles TypeScript and builds production bundle into `.next/` folder |
| `npm start` | Starts production server (you must run `npm run build` first) |

### Testing Payments Locally

Stripe provides test mode keys (prefixed with `sk_test_` and `pk_test_`). Use these during development. Test card number: `4242 4242 4242 4242` with any future expiry and any CVC.

For webhooks to work locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

This gives you a local `whsec_...` secret to use as `STRIPE_WEBHOOK_SECRET`.

---

## Production Deployment (VPS)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full walkthrough. The short version:

```bash
# On your VPS (Ubuntu 22.04)
git clone https://github.com/steelclutchsean/reluc.git
cd reluc/reluctant-seller-app
cp .env.example .env
nano .env                    # Fill in real API keys
npm install
npm run build
pm2 start npm --name "reluctant-seller" -- start
```

Then set up Nginx as a reverse proxy — see [deploy/configure-nginx.sh](deploy/configure-nginx.sh).

---

## Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `next` (14.x) | React framework with server-side rendering and API routes |
| `react` / `react-dom` (18.x) | UI library |
| `stripe` (17.x) | Stripe API client for creating checkout sessions and verifying payments |
| `@anthropic-ai/sdk` (0.30.x) | Anthropic Claude API client for AI email generation |
| `jose` (5.x) | JWT creation and verification (lightweight, no native dependencies) |

### Dev-only

| Package | Purpose |
|---------|---------|
| `typescript` (5.x) | Type checking |
| `tailwindcss` (3.x) | Utility-first CSS framework |
| `postcss` / `autoprefixer` | CSS processing pipeline for Tailwind |
| `@types/*` | TypeScript type definitions |

---

## Further Documentation

| Document | What It Covers |
|----------|---------------|
| [docs/ENV.md](docs/ENV.md) | Every environment variable: what it does, where to get it, format |
| [docs/API.md](docs/API.md) | All 6 API endpoints with request/response examples |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Auth flow, payment flow, component relationships, data flow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Step-by-step VPS deployment including Nginx and SSL |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common errors and how to fix them |

---

## Key Notes for Debugging in Cursor

- **All pages are client-side rendered** — every page file has `"use client"` at the top. This means they run in the browser, not on the server. Server-side logic only exists in the `api/` route files.
- **No database** — auth state lives entirely in JWT cookies. Stripe is the source of truth for payment status.
- **The `.env` file is critical** — if any key is missing or wrong, the corresponding feature breaks silently. The app does NOT validate env vars at startup.
- **API routes use Next.js App Router format** — each `route.ts` exports named functions like `POST` or `GET` (not default exports).
- **The `jose` library** handles JWT — it's used instead of `jsonwebtoken` because it works in edge runtimes.
- **Custom CSS classes** (`glass-card`, `glass-dark`, `btn-pill`, `spring-hover`, `ambient-bg`) are defined in `globals.css`, not Tailwind config.
