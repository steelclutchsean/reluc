# The Reluctant Seller - Master Plan

## Objective

Ship and operate a secure, reliable production app on Hostinger VPS with:

- Stripe + Coinbase payment flows
- Drizzle + Postgres entitlement storage
- Protected paywalled document delivery
- repeatable deployment and rollback runbooks

## Canonical Documentation Index

1. [01-HOSTINGER-DEPLOYMENT.md](./01-HOSTINGER-DEPLOYMENT.md) - deployment runbook
2. [02-SECURITY-PLAN.md](./02-SECURITY-PLAN.md) - security controls and checks
3. [03-PAYMENT-SETUP.md](./03-PAYMENT-SETUP.md) - Stripe/Coinbase setup
4. [06-LAUNCH-CHECKLIST.md](./06-LAUNCH-CHECKLIST.md) - launch gating checklist
5. [09-PREFLIGHT-CHECKLIST.md](./09-PREFLIGHT-CHECKLIST.md) - pre-deploy validation
6. [10-POST-DEPLOY-SMOKE-TESTS.md](./10-POST-DEPLOY-SMOKE-TESTS.md) - production verification
7. [11-ROLLBACK-BACKUP-RECOVERY.md](./11-ROLLBACK-BACKUP-RECOVERY.md) - rollback/backup/incident runbook

## Non-Negotiable Requirements

- No secrets committed to git
- No paid asset served from `public/`
- All entitlement checks backed by DB state
- Webhooks verified and idempotent
- Healthcheck endpoint available for uptime monitoring

## Environment Contract

All docs and scripts must use this naming:

- `COINBASE_COMMERCE_API_KEY` (not `COINBASE_API_KEY`)
- `ANTHROPIC_API_KEY` (not `CLAUDE_API_KEY`)
- `NEXT_PUBLIC_APP_URL` for canonical app origin
- `DATABASE_URL` for Postgres

## Deployment Scope

Hostinger VPS is the primary supported target for this repository. Vercel remains an optional path for dev/preview only.
