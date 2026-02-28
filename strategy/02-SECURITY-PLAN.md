# 02 - Security Hardening Plan

## Goal

Protect production traffic, payment flows, and paywalled assets with layered controls at the server, application, and data layers.

## Server Controls (Hostinger VPS)

- Enforce SSH hardening (non-default port, no root login, key-based auth)
- UFW only allows SSH, HTTP, HTTPS
- Fail2Ban enabled for SSH brute-force protection
- unattended-upgrades enabled
- TLS via certbot with auto-renew checks

## Application Controls

- Strict environment validation at startup
- No default fallback secrets in production code
- Shared input validation (email, plan, sessionId, payload size)
- Request origin checks for state-changing POST routes
- App-level API rate limiting + Nginx rate limiting
- Generic client error messages; detailed server logs only
- Timeouts for outbound API calls (Stripe/Coinbase/Anthropic)

## Payment Controls

- Stripe webhook signature verification
- Coinbase webhook HMAC verification
- Idempotent webhook event processing
- Entitlement changes persisted in Postgres
- Access to paid content requires active entitlement in DB

## Data Controls

- Postgres houses users/subscriptions/documents/access logs
- paid files are not stored under `public/`
- every protected document request is authenticated and logged
- `.env` is excluded from git and kept only on trusted systems

## Monitoring and Alerts

- PM2 + log rotation
- Nginx error/access logs monitored
- uptime checks against `/api/health`
- Stripe and Coinbase dashboard alerts enabled

## Security Checklist

- [ ] `JWT_SECRET` set and high entropy
- [ ] `DATABASE_URL` points to production Postgres over TLS
- [ ] Stripe and Coinbase webhooks verified in prod
- [ ] paid document URL cannot be accessed anonymously
- [ ] API abusive traffic is throttled
- [ ] health endpoint reports healthy status
