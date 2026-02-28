# 10 - Post-Deploy Smoke Tests

## Basic Health

1. `curl -sS https://reluctant.work/api/health`
2. verify response includes `ok: true`

## Public App

1. open landing page
2. confirm simulator link works
3. confirm pricing UI renders correctly

## Auth and Entitlement

1. visit `/dashboard` while logged out
2. expect access denied state
3. complete checkout in test mode
4. verify redirect to `/success` then `/dashboard`

## Document Access

1. logged-in entitled user requests document from dashboard
2. expect file download success
3. logged-out request to same endpoint should return 401/403

## Payment Events

1. Stripe webhook test event reaches `/api/webhook`
2. Coinbase webhook test event reaches `/api/crypto-webhook`
3. DB reflects expected entitlement updates

## Failure Checks

1. submit malformed API payloads
2. verify validation errors and non-sensitive responses
3. hit rate-limited endpoints repeatedly
4. verify throttling response
