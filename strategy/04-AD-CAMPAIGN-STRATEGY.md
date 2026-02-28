# 04 — Meta & Instagram Ad Campaign Strategy

**Goal:** Drive targeted traffic to The Reluctant Seller and convert visitors into paying customers within the first 48 hours of launch.

---

## Target Audience Profile

### Primary Audience: Founders & CEOs Who Sell
- **Age:** 28–55
- **Gender:** All (skew slightly male based on founder demographics)
- **Location:** United States (start here, expand later)
- **Income:** $75K+ household income
- **Education:** College-educated
- **Job titles:** Founder, CEO, Co-Founder, Managing Director, Business Owner

### Interests to Target on Meta:
- Entrepreneurship
- Startup companies
- Sales management
- B2B sales
- SaaS (Software as a Service)
- Business development
- YCombinator
- TechCrunch
- Venture capital
- Small business
- Business coaching
- Sales training
- Cold email outreach
- CRM software (Salesforce, HubSpot, Pipedrive)

### Behaviors:
- Business page admins
- Small business owners
- Engaged shoppers
- Digital purchases (last 7 days)
- Technology early adopters

### Exclusions (people NOT to show ads to):
- People who've already purchased (once you have pixel data)
- People under 22

---

## Campaign Structure

We'll run a **3-phase campaign** approach:

### Phase 1: Awareness + Free Value (Days 1-3) — 60% of budget
**Objective:** Traffic / Engagement
**Strategy:** Lead with the FREE simulator to build trust, then retarget with paid offer

**Ad Set 1A: "The Simulator Hook"**
- Drive traffic to the free interactive simulator
- Build the retargeting audience
- Low cost per click expected ($0.50-1.50)

**Ad Set 1B: "The Philosophy Hook"**
- Drive traffic to the landing page
- Lead with the core message: "Stop selling. Start letting people buy."
- Build awareness of the brand concept

### Phase 2: Conversion (Days 3-7) — 30% of budget
**Objective:** Conversions (Purchase)
**Strategy:** Retarget simulator visitors + landing page visitors with the paid product

**Ad Set 2A: "Retarget Simulator Users"**
- Target people who used the simulator
- Show them the value of the full playbook + email generator
- Expected higher conversion rate (they already engaged with free tool)

**Ad Set 2B: "Direct Conversion"**
- Target cold audience with most persuasive creative
- Lead with social proof and results

### Phase 3: Scale Winners (Days 7+) — 10% of budget (increase as winners emerge)
**Objective:** Conversions
**Strategy:** Double down on what's working, kill what isn't

---

## Budget Allocation

### Confirmed Budget: $100/day ($300 for first 3 days)

| Phase | Daily Budget | Duration | Total |
|-------|-------------|----------|-------|
| Phase 1A: Simulator Hook | $30/day | 3 days | $90 |
| Phase 1B: Philosophy Hook | $30/day | 3 days | $90 |
| Phase 2A: Retarget | $20/day | 3 days | $60 |
| Phase 2B: Direct Conversion | $20/day | 3 days | $60 |
| **Total** | **$100/day** | **3 days** | **$300** |

---

## Meta Pixel Setup (Critical for Tracking)

The Meta Pixel is a tiny piece of code that tells Meta when someone visits your site or makes a purchase. Without it, Meta can't optimize your ads.

### Step 1: Create a Meta Pixel

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Click **"Connect Data Sources"** → **"Web"** → **"Meta Pixel"**
3. Name it: `The Reluctant Seller Pixel`
4. Enter your website URL
5. Copy the **Pixel ID** (a long number like `123456789012345`)

### Step 2: Install the Pixel on Your Website

I'll add this to your Next.js app's `layout.tsx` file. The code goes in the `<head>` section:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID_HERE');
fbq('track', 'PageView');
</script>
```

### Step 3: Set Up Conversion Events

We need to track these events:
- **PageView** — Someone visits any page (automatic)
- **ViewContent** — Someone views the landing page pricing section
- **InitiateCheckout** — Someone clicks a payment button
- **Purchase** — Someone completes a payment

I'll add the Purchase event to fire on the success page.

---

## Ad Placements

### Recommended placements for launch:
- **Instagram Feed** — High engagement, visual format
- **Instagram Stories** — Full screen, immersive, great for hooks
- **Instagram Reels** — Video ads, highest organic-feeling format
- **Facebook Feed** — Broader reach, good for testing
- **Facebook Reels** — Growing format, lower competition

### Placements to skip initially:
- Audience Network (low quality traffic)
- Messenger (low intent)
- Right column (low engagement)

**Start with "Advantage+ placements"** and let Meta optimize, but exclude Audience Network and Messenger.

---

## Ad Creative Strategy

### Creative Format Mix:
- **2x Static Image Ads** (simple, clear, fast to create)
- **1x Carousel Ad** (show multiple benefits)
- **1x Video Ad** (15-30 seconds, can be text-on-screen style — no camera needed)

See **[05-AD-CREATIVES.md](./05-AD-CREATIVES.md)** for the full creative briefs with exact copy.

---

## Campaign Setup Walkthrough

### Step 1: Set Up Meta Business Manager

1. Go to [business.facebook.com](https://business.facebook.com)
2. Create a Business Account (if you don't have one)
3. Add your Facebook Page
4. Add your Instagram account
5. Go to **Ads Manager**

### Step 2: Create Campaign

1. Click **"+ Create"** in Ads Manager
2. Choose campaign objective:
   - Phase 1: Choose **"Traffic"** (cheaper clicks to build audience)
   - Phase 2: Choose **"Sales"** (optimizes for conversions)
3. Name: `RS - Phase 1 - Traffic - Feb 2026`
4. Keep **"Advantage Campaign Budget"** ON
5. Set daily budget

### Step 3: Create Ad Set

1. **Audience:**
   - Location: United States
   - Age: 28-55
   - Detailed targeting: Add interests listed above
   - Exclude: Custom audience of purchasers (once you have data)

2. **Placements:**
   - Use Advantage+ placements
   - Remove: Audience Network, Messenger

3. **Optimization:**
   - Phase 1: Optimize for "Link Clicks"
   - Phase 2: Optimize for "Conversions" → "Purchase" event

### Step 4: Create Ads
- Upload creatives
- Write ad copy (see creative briefs)
- Add UTM parameters to URLs:
  ```
  https://reluctant.work?utm_source=meta&utm_medium=paid&utm_campaign=launch_phase1&utm_content=simulator_hook
  ```

### Step 5: Submit for Review
- Meta reviews ads within 24 hours (usually faster)
- Ads must comply with Meta's policies (no misleading claims, no "get rich quick" language)

---

## Key Metrics to Track

| Metric | What It Means | Good Target |
|--------|---------------|-------------|
| CPM | Cost per 1,000 impressions | $10-30 |
| CPC | Cost per click | $0.50-2.00 |
| CTR | Click-through rate | 1-3% |
| Landing Page Views | People who actually loaded the page | 80%+ of clicks |
| Conversion Rate | Visitors who purchase | 2-5% |
| CPA | Cost per acquisition (per sale) | Under $30 |
| ROAS | Return on ad spend | 2x+ (for every $1 spent, get $2+ back) |

### Breakeven Analysis:
- If selling lifetime at $88, and CPA is $30, you profit $58 per sale
- You need just **4 sales per day** at $100/day ad spend to be profitable
- At $50/day ad spend, you need **2 sales per day**

---

## Rules for Optimization

### Day 1-2: Don't touch anything
Let Meta's algorithm learn. Resist the urge to change things.

### Day 3: First Review
- **Kill** any ad set with CPC > $3.00 and no conversions
- **Keep** any ad set with CTR > 1.5%
- **Increase budget** on ad sets with ROAS > 2x

### Day 5: Second Review
- Move 70% of budget to top 2 performing ad sets
- Create new variations of winning creatives
- Test new audiences similar to purchasers (lookalike audiences)

### Day 7+: Scale
- If profitable, increase daily budget by 20% every 2-3 days
- Never increase budget by more than 20-30% at once (causes algorithm reset)
- Create lookalike audiences from purchasers
