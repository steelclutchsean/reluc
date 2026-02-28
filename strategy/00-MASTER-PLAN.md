# The Reluctant Seller — 48-Hour Go-To-Market Master Plan

**Launch Target:** Go live within 48 hours (by February 27, 2026)
**Goal:** Fully functional, secure, revenue-ready website on a custom domain

---

## Strategy Documents Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Hostinger Deployment Guide](./01-HOSTINGER-DEPLOYMENT.md) | Step-by-step setup: domain, hosting, SSL, deploy |
| 02 | [Security Hardening Plan](./02-SECURITY-PLAN.md) | Protect against hackers, secure payments, data safety |
| 03 | [Payment Gateway Setup](./03-PAYMENT-SETUP.md) | Stripe + Coinbase Commerce configuration |
| 04 | [Meta & Instagram Ads Strategy](./04-AD-CAMPAIGN-STRATEGY.md) | Targeting, creatives, budget, launch plan |
| 05 | [Ad Creative Briefs](./05-AD-CREATIVES.md) | Copy, visuals, hooks for each ad variant |
| 06 | [Launch Checklist](./06-LAUNCH-CHECKLIST.md) | Hour-by-hour execution timeline |
| 07 | [Post-Launch Optimization](./07-POST-LAUNCH.md) | First 7 days: metrics, iteration, scaling |

---

## 48-Hour Timeline Overview

### HOUR 0–8: Foundation (Day 1 Morning)
- [ ] Purchase custom domain via Hostinger
- [ ] Set up Hostinger VPS or Cloud hosting
- [ ] Configure SSL certificate (free with Hostinger)
- [ ] Set up Stripe account with test + live keys
- [ ] Create Stripe products ($13/month subscription + $88 lifetime)
- [ ] Set up Coinbase Commerce account
- [ ] Configure environment variables

### HOUR 8–16: Build & Deploy (Day 1 Afternoon/Evening)
- [ ] Export Next.js app as static site OR configure Node.js on Hostinger
- [ ] Deploy application to Hostinger
- [ ] Connect custom domain to hosting
- [ ] Test all payment flows (Stripe test mode)
- [ ] Test email generator with Claude API key
- [ ] Verify SSL is working (https://)
- [ ] Security hardening (headers, rate limiting, input validation)

### HOUR 16–24: Polish & Prep Ads (Day 1 Night / Day 2 Morning)
- [ ] Final design review and polish
- [ ] Set up Meta Business Manager account
- [ ] Create Facebook Page for the brand
- [ ] Set up Instagram Business account
- [ ] Install Meta Pixel on the website
- [ ] Create ad creatives (images + copy)
- [ ] Set up conversion tracking

### HOUR 24–36: Ads & Testing (Day 2 Afternoon)
- [ ] Switch Stripe to live mode
- [ ] Run full end-to-end purchase test with real card
- [ ] Submit ads for review on Meta
- [ ] Set up retargeting audience
- [ ] Create lookalike audiences
- [ ] Final security audit

### HOUR 36–48: Launch (Day 2 Evening)
- [ ] Activate ad campaigns
- [ ] Monitor first impressions and clicks
- [ ] Verify conversion tracking fires correctly
- [ ] Share on personal social channels
- [ ] Monitor for any errors or issues
- [ ] Celebrate launch!

---

## Budget Estimate (Launch Week)

| Item | Cost |
|------|------|
| Hostinger Cloud Hosting (monthly) | ~$10-25/month |
| Custom Domain (.com) | ~$10-15/year |
| Meta Ads (first 3 days) | $50-150 |
| Stripe fees | 2.9% + $0.30 per transaction |
| Claude API (email generator) | ~$5-20/month depending on usage |
| **Total Launch Cost** | **~$75-210** |

---

## Key Decisions Needed From You

### Confirmed Decisions

1. **Domain:** `reluctant.work` (purchasing from GoDaddy)
2. **Hosting:** Hostinger VPS (existing account)
3. **Ad budget:** $100/day ($300 for first 3 days)
4. **Target audience:** Founders, CEOs, sales leaders
5. **Stripe:** Using existing Stripe account (new products to be created)
6. **Domain registrar note:** Domain is on GoDaddy — point nameservers or A record to Hostinger VPS IP
