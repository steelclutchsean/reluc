# 03 — Payment Gateway Setup

**Goal:** Configure Stripe and Coinbase Commerce to securely accept all payment methods.

---

## Payment Methods Supported

| Method | Provider | Fee |
|--------|----------|-----|
| Visa, Mastercard, Amex | Stripe | 2.9% + $0.30 |
| PayPal | Stripe (PayPal integration) | 2.9% + $0.30 |
| Venmo | Stripe (Venmo integration) | 2.9% + $0.30 |
| Apple Pay | Stripe | 2.9% + $0.30 |
| Google Pay | Stripe | 2.9% + $0.30 |
| Bitcoin & Crypto | Coinbase Commerce | 1% |

---

## Part 1: Stripe Setup

### Step 1: Create Your Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Enter your email and create a password
4. **Important:** Use a business email if you have one
5. Complete the onboarding:
   - Business type (likely "Individual/Sole proprietor")
   - Your legal name
   - Address
   - Last 4 digits of SSN (required by law for payment processing)
   - Bank account for payouts (where your money goes)

### Step 2: Create Your Products in Stripe

1. In the Stripe Dashboard, go to **Products** (left sidebar)
2. Click **"+ Add product"**

**Product 1: Monthly Subscription**
- Name: `The Reluctant Seller — Monthly`
- Description: `Full playbook + unlimited AI email rewrites`
- Click **"Add pricing"**:
  - Price: `$13.00`
  - Billing period: `Monthly`
  - Click **"Save product"**
- **Copy the Price ID** (starts with `price_`) — you'll need this

**Product 2: Lifetime Access**
- Name: `The Reluctant Seller — Lifetime`
- Description: `Pay once, own forever. Full playbook + unlimited AI email rewrites.`
- Click **"Add pricing"**:
  - Price: `$88.00`
  - One time
  - Click **"Save product"**
- **Copy the Price ID** (starts with `price_`) — you'll need this

### Step 3: Get Your API Keys

1. Go to **Developers** → **API keys** (left sidebar)
2. You'll see two types:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) — this is public, safe to share
   - **Secret key** (starts with `sk_test_` or `sk_live_`) — this is SECRET, never share this

**For testing:** Use the `test` keys first. Switch to `live` keys when ready to accept real payments.

3. Copy both keys — they go in your `.env` file

### Step 4: Set Up the Webhook

Webhooks are how Stripe tells your website "hey, someone just paid!" Here's how to set it up:

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://reluctant.work/api/webhook`
4. Select events to listen to:
   - `checkout.session.completed` (someone finished paying)
   - `customer.subscription.deleted` (someone cancelled)
   - `customer.subscription.updated` (subscription status changed)
5. Click **"Add endpoint"**
6. **Copy the Webhook Signing Secret** (starts with `whsec_`) — goes in your `.env` file

### Step 5: Enable PayPal and Venmo

1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Find **PayPal** and click **"Turn on"**
3. Connect your PayPal business account (or create one)
4. Venmo is automatically available for US PayPal users
5. No code changes needed — Stripe handles this in the checkout page

### Step 6: Enable Apple Pay & Google Pay

1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Apple Pay and Google Pay are usually enabled by default
3. For Apple Pay, you may need to verify your domain:
   - Go to **Settings** → **Payment methods** → **Apple Pay**
   - Click **"Add new domain"**
   - Enter your domain name
   - Download the verification file
   - Upload it to your server at: `https://reluctant.work/.well-known/apple-developer-merchantid-domain-association`

---

## Part 2: Coinbase Commerce Setup

### Step 1: Create Your Account

1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Sign up with your email
3. Connect your Coinbase account (or create one) — this is where crypto payments go

### Step 2: Create a Checkout

1. In the Coinbase Commerce Dashboard, go to **Settings** → **API keys**
2. Click **"Create an API key"**
3. **Copy the API key** — goes in your `.env` file

### Step 3: Configure Webhooks (Optional but Recommended)

1. Go to **Settings** → **Webhook subscriptions**
2. Add your endpoint: `https://reluctant.work/api/crypto-webhook`
3. Copy the **Webhook Shared Secret**

---

## Your .env File (Complete)

After setting up both services, your `.env` file should look like this:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx        # Monthly $13
STRIPE_LIFETIME_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx  # Lifetime $88
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Coinbase Commerce
COINBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Claude AI (for email generator)
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Security
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 64+ random characters

# App
NEXT_PUBLIC_BASE_URL=https://reluctant.work
```

### How to generate a strong JWT_SECRET:

Option 1 — On your VPS, run:
```bash
openssl rand -hex 32
```

Option 2 — Use a password manager to generate a 64-character random string.

---

## Testing Payments (Before Going Live)

### Stripe Test Cards

Use these fake card numbers in test mode to verify everything works:

| Card Number | What It Tests |
|-------------|---------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication required |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

For all test cards:
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Testing Checklist

```
□ Monthly subscription checkout works (test card)
□ Lifetime one-time payment works (test card)
□ Webhook fires after payment (check server logs)
□ JWT cookie is set after successful payment
□ Dashboard is accessible after payment
□ Email generator works on dashboard
□ PDF download works on dashboard
□ Crypto checkout redirects to Coinbase
□ Declined card shows proper error message
□ "Already a member" link works after payment
```

---

## Switching to Live Mode

When you're ready to accept real money:

1. In Stripe Dashboard, toggle from **"Test mode"** to **"Live mode"** (top right)
2. Copy the new **live** API keys (they start with `sk_live_` and `pk_live_`)
3. Create a new **live** webhook endpoint pointing to your production URL
4. Update your `.env` file on the VPS with the live keys
5. Restart the app: `pm2 restart reluctant-seller`
6. Make one real purchase with your own card to verify
7. Refund yourself in the Stripe Dashboard

---

## Revenue Projections

| Scenario | Monthly Sales | Revenue |
|----------|--------------|---------|
| Conservative | 10 lifetime + 5 monthly | $945/month |
| Moderate | 25 lifetime + 15 monthly | $2,395/month |
| Optimistic | 50 lifetime + 30 monthly | $4,790/month |

*Note: Stripe takes 2.9% + $0.30 per transaction. On an $88 sale, that's ~$2.85 in fees, so you net ~$85.15.*
