# 11 - Rollback, Backup, Recovery

## Rollback Procedure

1. Keep last known good release artifact on VPS.
2. If release fails:
   - restore previous artifact
   - run `npm ci && npm run build`
   - restart process: `pm2 restart reluctant-seller`
3. If migration caused issue:
   - restore DB snapshot
   - redeploy prior code version

## Backups

- Database: daily `pg_dump` snapshot retained for at least 7 days
- App config: encrypted backup of `.env` in secure secret manager
- TLS config: backup Nginx site config and cert metadata

## Recovery Drills

- Quarterly restore test to staging
- Verify restored DB can satisfy dashboard entitlement checks
- Verify document retrieval works after restore

## Incident Response Basics

1. Rotate compromised credentials immediately
2. Revoke and regenerate webhook secrets
3. Audit recent logs (PM2 + Nginx + provider dashboards)
4. Patch and redeploy
