# 01 - Hostinger Deployment Guide

## Goal

Deploy `reluctant-seller-app` to Hostinger VPS with TLS, Nginx reverse proxy, PM2 process management, and Postgres-backed paywall features.

## Prerequisites

- Hostinger VPS (Ubuntu 22.04)
- Domain DNS pointing to VPS IP (`@` and `www`)
- Node.js 20+, npm, git
- Stripe and Coinbase credentials
- reachable Postgres instance and `DATABASE_URL`

## Canonical Environment Variables

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
STRIPE_LIFETIME_PRICE_ID=
STRIPE_BILLING_PORTAL_URL=
COINBASE_COMMERCE_API_KEY=
COINBASE_WEBHOOK_SHARED_SECRET=
ANTHROPIC_API_KEY=
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=https://reluctant.work
NEXT_PUBLIC_BASE_URL=https://reluctant.work
NEXT_PUBLIC_META_PIXEL_ID=
```

## Deploy Steps

1. **Provision server**
   - `apt update && apt upgrade -y`
   - install `nginx certbot python3-certbot-nginx ufw fail2ban`
   - install Node 20 and PM2

2. **Upload code**
   - target path: `/var/www/reluctant-seller`
   - example:
     - `scp -r /ABSOLUTE/PATH/reluctant-seller-app/* deployer@YOUR_VPS_IP:/var/www/reluctant-seller/`

3. **Install + build**
   - `cd /var/www/reluctant-seller`
   - `npm ci`
   - `npm run db:migrate`
   - `npm run build`
   - `pm2 start npm --name reluctant-seller -- start`
   - `pm2 save && pm2 startup`

4. **Configure Nginx**
   - proxy to `http://localhost:3000`
   - keep security headers + rate limits from deploy scripts
   - validate: `nginx -t`
   - restart: `systemctl restart nginx`

5. **Enable TLS**
   - `certbot --nginx -d reluctant.work -d www.reluctant.work --redirect`
   - verify renewal: `certbot renew --dry-run`

6. **Configure webhooks**
   - Stripe endpoint: `https://reluctant.work/api/webhook`
   - Coinbase endpoint: `https://reluctant.work/api/crypto-webhook`

## Post-Deploy Verification

Run the full smoke checklist from `10-POST-DEPLOY-SMOKE-TESTS.md`.

Minimum checks:

- landing page renders
- checkout sessions create successfully
- webhook updates entitlements
- dashboard requires auth when unauthenticated
- paid document is retrievable only when authorized
- `/api/health` returns healthy status

## Quick Operations

```bash
pm2 status
pm2 logs reluctant-seller
pm2 restart reluctant-seller
cd /var/www/reluctant-seller && npm run build && pm2 restart reluctant-seller
```
