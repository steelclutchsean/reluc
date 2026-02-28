# 09 - Preflight Checklist

Run this before any production deploy.

- [ ] Clean git working tree or intentionally staged changes only
- [ ] `npm ci` passes
- [ ] `npm run build` passes locally
- [ ] `npm run db:generate` and `npm run db:migrate` pass
- [ ] No secrets in tracked files
- [ ] `.env.example` matches code-required variables
- [ ] Stripe and Coinbase webhook endpoints confirmed
- [ ] Hostinger VPS has enough disk and memory
- [ ] Postgres connectivity validated from VPS
- [ ] Rollback package/version is identified before release
