# The Reluctant Seller — Deploy Guide

A Next.js app with Stripe subscriptions, Coinbase crypto payments, and an AI-powered email generator. Designed for one-click Vercel deployment.

---

## What's Included

- **Landing page** — Marketing page with pricing, two payment options (Stripe + Crypto)
- **Interactive Simulator** — Free, standalone HTML (no server needed)
- **Paid Dashboard** — PDF playbook download + Reluctant Email Generator (AI-powered)
- **Stripe Integration** — $13/month subscription OR $88 lifetime access via credit card, PayPal, or Venmo
- **Coinbase Commerce** — Bitcoin and crypto payments
- **Claude AI** — Generates 3 unique "reluctant" email rewrites from any sales email

---

## Step 1: Set Up Stripe

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and create an account (or log in).

2. **Create a Product and Price:**
   - Go to **Products** in the left sidebar.
   - Click **Add product**.
   - Name it "The Reluctant Seller" (or whatever you like).
   - Under **Pricing**, add TWO prices:
     - **Price 1 (Monthly):** Recurring, $13.00 USD, Monthly. Copy its Price ID → `STRIPE_PRICE_ID`
     - **Price 2 (Lifetime):** One-time, $88.00 USD. Copy its Price ID → `STRIPE_LIFETIME_PRICE_ID`
   - Click **Save product**.

3. **Enable PayPal and Venmo (in Stripe Dashboard):**
   - Go to **Settings** → **Payment methods**.
   - Find **PayPal** and toggle it ON. Follow the prompts to connect your PayPal business account.
   - Once PayPal is enabled, **Venmo** automatically becomes available for US customers.
   - These require NO code changes — Stripe handles them in the checkout page.

4. **Set Up the Webhook:**
   - Go to **Developers** → **Webhooks**.
   - Click **Add endpoint**.
   - Set the URL to: `https://YOUR-DOMAIN.vercel.app/api/webhook`
   - Select these events: `checkout.session.completed` and `customer.subscription.deleted`.
   - Click **Add endpoint**.
   - On the webhook page, reveal the **Signing secret** — it starts with `whsec_`. Copy it for the `STRIPE_WEBHOOK_SECRET` variable.

5. **Get Your API Keys:**
   - Go to **Developers** → **API keys**.
   - Copy the **Publishable key** (starts with `pk_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy the **Secret key** (starts with `sk_`) → `STRIPE_SECRET_KEY`

> **Important:** Use **Test mode** keys while developing. Switch to **Live mode** when you're ready to accept real payments.

---

## Step 2: Set Up Coinbase Commerce (for Crypto)

1. Go to [https://commerce.coinbase.com](https://commerce.coinbase.com) and create an account.

2. Go to **Settings** → **API Keys**.

3. Create a new API key. Copy it → `COINBASE_COMMERCE_API_KEY`

> If you don't want crypto payments, you can skip this. The crypto button on the landing page will show an error, but everything else works fine.

---

## Step 3: Get Your Claude API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com) and create an account.

2. Go to **API Keys** and create a new key.

3. Copy it → `ANTHROPIC_API_KEY`

4. Add credits to your account. The email generator uses Claude Sonnet, which costs roughly $0.01–0.03 per email generation (3 versions).

---

## Step 4: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push this folder to a new GitHub repository:
   ```bash
   cd reluctant-seller-app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/reluctant-seller.git
   git push -u origin main
   ```

2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.

3. Click **Add New** → **Project**.

4. Import your `reluctant-seller` repository.

5. Vercel will auto-detect it as a Next.js project. Click **Deploy**.

6. After deployment, go to your project **Settings** → **Environment Variables** and add ALL of the following:

   | Variable | Value |
   |----------|-------|
   | `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` for testing) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...`) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
   | `STRIPE_PRICE_ID` | `price_...` (monthly $13 subscription) |
   | `STRIPE_LIFETIME_PRICE_ID` | `price_...` (one-time $88 lifetime) |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |
   | `COINBASE_COMMERCE_API_KEY` | Your Coinbase Commerce key |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
   | `JWT_SECRET` | Any long random string (e.g., run `openssl rand -hex 32` in your terminal) |

7. Click **Redeploy** after adding variables (Vercel needs to rebuild with the new env vars).

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
cd reluctant-seller-app
vercel
```

Follow the prompts. Then add environment variables in the Vercel dashboard as described above.

---

## Step 5: Update Your Stripe Webhook URL

After deployment, go back to Stripe → Developers → Webhooks and update the endpoint URL to:

```
https://YOUR-ACTUAL-DOMAIN.vercel.app/api/webhook
```

Replace `YOUR-ACTUAL-DOMAIN` with your real Vercel URL.

---

## Step 6: Set Up Stripe Customer Portal (for Cancellations)

1. In Stripe Dashboard, go to **Settings** → **Billing** → **Customer portal**.

2. Enable the portal and configure which actions customers can take (cancel subscription, update payment method, etc.).

3. The dashboard links to the billing portal for subscription management.

---

## How It All Works

Here's the flow from a customer's perspective:

1. **Customer visits your site** → Sees the landing page with pricing.
2. **Clicks "Pay with Card / PayPal / Venmo"** → Enters their email → Goes to Stripe Checkout (Stripe handles all the payment UI, card entry, PayPal redirect, etc.).
3. **Or clicks "Pay with Bitcoin / Crypto"** → Goes to Coinbase Commerce checkout.
4. **After successful payment** → Redirected to `/success` → App verifies the payment with Stripe → Creates an authentication cookie → Redirected to `/dashboard`.
5. **On the dashboard** → Can download the PDF playbook and use the AI email generator.
6. **On return visits** → Goes to `/dashboard` → App checks the cookie + verifies the subscription is still active with Stripe.

---

## File Structure

```
reluctant-seller-app/
├── public/
│   ├── simulator.html          # Free interactive simulator
│   └── The_Reluctant_Seller.pdf # Paid playbook PDF
├── src/app/
│   ├── globals.css             # Styles (glass UI, animations)
│   ├── layout.tsx              # Root layout
│   ├── logo.tsx                # Lemon + $100 bills SVG logo
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   └── page.tsx            # Paid dashboard (email gen + PDF)
│   ├── success/
│   │   └── page.tsx            # Post-payment verification
│   └── api/
│       ├── checkout/route.ts       # Stripe checkout session
│       ├── webhook/route.ts        # Stripe webhook handler
│       ├── verify/route.ts         # Create auth cookie after payment
│       ├── verify/check/route.ts   # Check if user is authorized
│       ├── generate/route.ts       # Claude AI email generator
│       └── crypto-checkout/route.ts # Coinbase Commerce checkout
├── .env.example                # Template for environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Troubleshooting

**"Payment error" when clicking checkout:**
- Make sure your `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are set correctly in Vercel env vars.
- Make sure you redeployed after adding the variables.

**Dashboard says "Access Required" after paying:**
- Check that the Stripe webhook is set up correctly and pointing to your live URL.
- The webhook creates the auth cookie. Without it, the app can't verify payment.

**Email generator returns an error:**
- Verify your `ANTHROPIC_API_KEY` is valid and has credits.
- Check the Vercel function logs for detailed error messages.

**Crypto button doesn't work:**
- Verify your `COINBASE_COMMERCE_API_KEY` is set. If you don't want crypto, remove the button from `page.tsx`.

---

## Local Development

```bash
cd reluctant-seller-app
cp .env.example .env
# Fill in your .env with real keys
npm install
npm run dev
```

Visit `http://localhost:3000`. For webhooks to work locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

---

Built with Next.js 14, Stripe, Coinbase Commerce, and Claude AI.
