# 03 - Payment Setup

## Goal

Configure Stripe and Coinbase Commerce so payment status can be verified server-side and persisted to Postgres entitlements.

## Stripe Configuration

1. Create two prices:
   - monthly recurring (`STRIPE_PRICE_ID`)
   - lifetime one-time (`STRIPE_LIFETIME_PRICE_ID`)
2. Collect keys:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Configure webhook endpoint:
   - `https://reluctant.work/api/webhook`
4. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Save webhook signing secret as `STRIPE_WEBHOOK_SECRET`
6. Enable Stripe customer portal and set `STRIPE_BILLING_PORTAL_URL`

## Coinbase Commerce Configuration

1. Create API key -> `COINBASE_COMMERCE_API_KEY`
2. Configure webhook endpoint:
   - `https://reluctant.work/api/crypto-webhook`
3. Save shared secret as `COINBASE_WEBHOOK_SHARED_SECRET`

## Required Environment Block

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
STRIPE_LIFETIME_PRICE_ID=
STRIPE_BILLING_PORTAL_URL=
COINBASE_COMMERCE_API_KEY=
COINBASE_WEBHOOK_SHARED_SECRET=
NEXT_PUBLIC_APP_URL=https://reluctant.work
NEXT_PUBLIC_BASE_URL=https://reluctant.work
JWT_SECRET=
DATABASE_URL=
```

## Pre-Launch Payment Test Matrix

- Stripe monthly purchase succeeds in test mode
- Stripe lifetime purchase succeeds in test mode
- Stripe webhook creates/updates DB entitlement
- cancelled subscription revokes access in DB
- Coinbase charge creation succeeds
- Coinbase webhook grants entitlement after confirmed charge
- unauthorized user cannot download paid document
