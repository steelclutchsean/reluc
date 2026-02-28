# 07 — Post-Launch Optimization (First 7 Days)

**Goal:** Monitor performance, optimize ads, iterate on what's working, and scale revenue.

---

## Day 1: Monitor & Don't Touch

### What to do:
- Check Meta Ads Manager every 4-6 hours
- Check Stripe Dashboard for payments
- Monitor website uptime (uptimerobot.com)
- Check PM2 logs for any errors: `pm2 logs`

### What NOT to do:
- Don't change ad budgets
- Don't turn off ad sets
- Don't change targeting
- Don't panic if there are no sales yet (it's day 1!)

### Metrics to note:
```
Total ad spend: $____
Impressions: ____
Clicks: ____
CTR: ____%
CPC: $____
Landing page views: ____
Purchases: ____
Revenue: $____
```

---

## Day 2: First Signals

### Check these metrics:

**Ad Performance:**
- Which creative has the highest CTR? (goal: > 1.5%)
- Which creative has the lowest CPC? (goal: < $2.00)
- Are any ads stuck at $0 spend? (might be a targeting issue)

**Website Performance:**
- How many people visited? (check Nginx access logs or add Google Analytics)
- How many clicked a payment button?
- How many completed payment?
- What's the conversion rate? (purchases ÷ visitors)

### Small adjustments allowed:
- If one ad creative has 2x the CTR of another, you can pause the underperformer
- If CPC is above $3.00 on all ads, consider broadening your audience slightly

---

## Day 3: First Optimization Round

### Kill underperformers:
- Any ad set with CPC > $3.50 and zero conversions → pause it
- Any ad set with CTR < 0.5% → pause it
- Any ad set with 0 link clicks after $20+ spend → pause it

### Double down on winners:
- Any ad set with CTR > 2% → increase budget by 20%
- Any ad set with a conversion → keep it running, consider budget increase
- Any ad set with ROAS > 2x → this is your hero, protect it

### New tests to launch:
- Create 2 new variations of your best-performing creative
- Test a different headline or primary text
- Consider testing a different audience segment

---

## Day 4-5: Retargeting Focus

By now you should have enough website visitors to build meaningful retargeting audiences.

### Actions:
1. In Meta Ads Manager, check your retargeting ad set performance
2. Create a **Lookalike Audience** based on website visitors:
   - Go to Audiences → Create Audience → Lookalike Audience
   - Source: Your website visitors custom audience
   - Location: United States
   - Size: 1% (most similar to your visitors)

3. Create a new ad set targeting this lookalike audience with your best creative

4. Consider creating organic Instagram posts:
   - Share a key insight from the playbook
   - Post a screenshot of the simulator
   - Share the "Stop Selling. Start Letting People Buy." quote as a text post

---

## Day 6-7: Scale Decision

### Review the full week's data:

```
WEEK 1 SCORECARD
─────────────────────────────────
Total Ad Spend:        $____
Total Revenue:         $____
ROAS:                  ____x
─────────────────────────────────
Total Impressions:     ____
Total Clicks:          ____
Average CPC:           $____
Average CTR:           ____%
─────────────────────────────────
Website Visitors:      ____
Free Simulator Users:  ____
Paying Customers:      ____
Conversion Rate:       ____%
─────────────────────────────────
Revenue per Customer:  $____
Cost per Customer:     $____
Profit per Customer:   $____
─────────────────────────────────
```

### Decision Matrix:

| ROAS | Action |
|------|--------|
| < 0.5x | Pause all ads. Rethink targeting and creative. |
| 0.5-1x | Keep running but reduce budget. Test new creatives. |
| 1-2x | Profitable! Optimize and gradually increase budget. |
| 2-3x | Great performance. Increase budget 20% every 2 days. |
| 3x+ | Scale aggressively. Create lookalikes. Test new placements. |

---

## Ongoing Optimization Ideas

### Week 2+ Growth Tactics:

1. **Create testimonials** — Reach out to first customers for feedback. Even simple quotes boost credibility.

2. **Add social proof to the landing page** — Once you have 5+ customers, add a counter or testimonials.

3. **Content marketing** — Write short LinkedIn posts about the reluctant selling philosophy. Each post links back to your site.

4. **Email list** — Consider adding an email capture (free PDF excerpt or mini-guide) for people who aren't ready to buy yet. Follow up with value-first emails.

5. **Partnerships** — Reach out to sales coaching communities, founder groups, startup accelerators.

6. **Product expansion:**
   - Add more simulator scenarios
   - Create advanced playbook modules
   - Offer 1-on-1 coaching sessions at a premium price
   - Create a community (Slack or Discord) for paid members

---

## Monthly Review Template

Use this template every month to track your business health:

```
MONTHLY REVIEW — [Month Year]
═══════════════════════════════

REVENUE
  Lifetime purchases: ____ × $88 = $____
  Monthly subscriptions: ____ × $13 = $____
  Total revenue: $____
  Stripe fees: -$____
  Net revenue: $____

MARKETING
  Total ad spend: $____
  ROAS: ____x
  Best performing ad: ____
  Best performing audience: ____
  Cost per acquisition: $____

PRODUCT
  Active monthly subscribers: ____
  Churn rate: ____%
  Emails generated (API usage): ____
  Simulator sessions: ____

PRIORITIES FOR NEXT MONTH
  1. ____
  2. ____
  3. ____
```

---

## When to Consider Scaling Beyond Meta

Once your Meta/Instagram ads are consistently profitable (ROAS > 2x for 2+ weeks), consider:

1. **Google Ads** — Target people searching for "sales training," "cold email templates," "how to sell without being pushy"
2. **LinkedIn Ads** — Higher cost per click but very targeted for B2B founders/CEOs
3. **YouTube Ads** — Video content about reluctant selling philosophy
4. **Twitter/X Ads** — Good for reaching tech founders
5. **Reddit Ads** — Target r/sales, r/startups, r/entrepreneur
6. **Podcast Sponsorships** — Find sales or startup podcasts with your target audience
