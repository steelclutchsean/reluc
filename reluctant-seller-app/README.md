# The Reluctant Seller

Production-ready Next.js app with Stripe + Coinbase payments, DB-backed paywall access, and AI email generation.

## Primary Deployment Target

This repository is maintained for **Hostinger VPS (Ubuntu 22.04)** as the primary remote deployment path.

- Primary guide: `strategy/01-HOSTINGER-DEPLOYMENT.md`
- Security guide: `strategy/02-SECURITY-PLAN.md`
- Payment setup: `strategy/03-PAYMENT-SETUP.md`
- Launch checklist: `strategy/06-LAUNCH-CHECKLIST.md`

## Core Features

- Public landing page + free simulator
- Paywalled dashboard
- Stripe monthly and lifetime plans
- Coinbase Commerce crypto checkout
- Drizzle + Postgres for users/subscriptions/documents
- Protected document retrieval API (no public paid asset URL)

## Environment Variables

Copy `.env.example` to `.env` and set all values.

```bash
cp .env.example .env
```

Required keys:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_LIFETIME_PRICE_ID`
- `STRIPE_BILLING_PORTAL_URL`
- `COINBASE_COMMERCE_API_KEY`
- `COINBASE_WEBHOOK_SHARED_SECRET`
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_META_PIXEL_ID` (optional)

## Local Development

```bash
npm install
npm run db:generate
npm run dev
```

In a second terminal, run Stripe webhook forwarding for local tests:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Database Commands

```bash
npm run db:generate
npm run db:migrate
```

## Deploy (Hostinger VPS)

1. Prepare VPS and DNS using `strategy/01-HOSTINGER-DEPLOYMENT.md`
2. Upload app code to `/var/www/reluctant-seller`
3. Create `.env` with production values
4. Run:

```bash
npm ci
npm run db:migrate
npm run build
pm2 start npm --name reluctant-seller -- start
```

5. Configure Nginx + SSL and restart services
6. Run smoke tests from `strategy/10-POST-DEPLOY-SMOKE-TESTS.md`

## Alternate Deployment

Vercel can still be used as an alternate deployment target, but Hostinger remains the canonical path for this repo.
