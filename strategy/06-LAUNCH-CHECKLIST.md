# 06 - Launch Checklist

## Release Gate Checklist

### Infrastructure

- [ ] DNS `@` and `www` resolve to Hostinger VPS
- [ ] Nginx config validated with `nginx -t`
- [ ] TLS active for both apex and `www`
- [ ] PM2 process running and configured to auto-start
- [ ] `/api/health` returns healthy

### Secrets and Configuration

- [ ] `.env` contains all required keys from `.env.example`
- [ ] `JWT_SECRET` rotated and high entropy
- [ ] `DATABASE_URL` tested from app host
- [ ] Stripe and Coinbase webhook secrets set

### Data and Paywall

- [ ] DB migrations ran successfully
- [ ] Stripe webhook can create/update subscription records
- [ ] Coinbase webhook can grant entitlement
- [ ] paid document endpoint denies anonymous access
- [ ] paid document endpoint succeeds for entitled user

### Functional E2E

- [ ] Stripe monthly checkout in test mode works
- [ ] Stripe lifetime checkout in test mode works
- [ ] success flow sets auth cookie and grants dashboard access
- [ ] dashboard AI generation works with valid API key
- [ ] billing portal link points to configured production URL

### Operations

- [ ] Uptime monitor configured for `/api/health`
- [ ] PM2 log rotation installed
- [ ] Backup cron documented and tested
- [ ] Rollback runbook reviewed by operator
