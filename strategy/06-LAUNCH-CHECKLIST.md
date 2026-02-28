# 06 — Hour-by-Hour Launch Checklist

**Start Time:** When you begin. Mark each item as you complete it.

---

## BLOCK 1: Accounts & Purchases (Hours 0-2)

```
□ Purchase Hostinger VPS (KVM 1 plan)
  → Choose Ubuntu 22.04, US data center
  → Note your IP address and root password

□ Purchase/register custom domain on Hostinger
  → Point A records to your VPS IP (@  and www)

□ Create Stripe account (if don't have one)
  → Complete business verification
  → Note: Verification can take a few hours — start early

□ Create products in Stripe:
  → Monthly: $13/month recurring
  → Lifetime: $88 one-time
  → Copy both Price IDs

□ Get Stripe API keys (test mode first):
  → Secret key (sk_test_...)
  → Copy it somewhere safe

□ Create Coinbase Commerce account
  → Get API key

□ Get Claude API key from console.anthropic.com
  → Already have one? Skip this step
```

---

## BLOCK 2: Server Setup (Hours 2-4)

```
□ SSH into your VPS:
  → Mac: Terminal → ssh root@YOUR_IP
  → Windows: PuTTY → enter IP

□ Run server setup commands (from 01-HOSTINGER-DEPLOYMENT.md):
  → apt update && apt upgrade -y
  → Install Node.js 20
  → Install PM2
  → Install Nginx
  → Install Certbot

□ Security hardening (from 02-SECURITY-PLAN.md):
  → Change SSH port
  → Set up UFW firewall
  → Install Fail2Ban
  → Create non-root user
  → Enable auto-updates
```

---

## BLOCK 3: Deploy the App (Hours 4-6)

```
□ Upload app files to VPS
  → scp command from local machine

□ Create .env file on VPS with all keys:
  → STRIPE_SECRET_KEY (test mode)
  → STRIPE_PRICE_ID
  → STRIPE_LIFETIME_PRICE_ID
  → STRIPE_WEBHOOK_SECRET
  → COINBASE_API_KEY
  → CLAUDE_API_KEY
  → JWT_SECRET (generate with: openssl rand -hex 32)
  → NEXT_PUBLIC_BASE_URL

□ Install dependencies: npm install
□ Build the app: npm run build
□ Start with PM2: pm2 start npm --name "reluctant-seller" -- start
□ Verify running: pm2 status

□ Configure Nginx (from deployment guide)
  → Create config file
  → Add security headers
  → Add rate limiting
  → Enable site, test, restart

□ Set up SSL with Certbot
  → certbot --nginx -d reluctant.work -d www.reluctant.work
  → Test auto-renewal
```

---

## BLOCK 4: Test Everything (Hours 6-8)

```
□ Open https://reluctant.work in browser
  → Landing page loads correctly?
  → Logo shows the money tree (not lemon)?
  → Monthly/Lifetime toggle works?
  → Design looks clean and professional?

□ Test free simulator:
  → https://reluctant.work/simulator.html
  → All 5 scenarios work?
  → Results show properly?

□ Test Stripe checkout (TEST MODE):
  → Enter email, click payment button
  → Redirects to Stripe checkout?
  → Use test card: 4242 4242 4242 4242
  → Payment succeeds?
  → Redirects to success page?
  → Dashboard loads after?

□ Test email generator on dashboard:
  → Paste a sample email
  → Add context
  → Click generate
  → 3 versions appear?
  → Copy button works?

□ Test PDF download:
  → Click download playbook button
  → PDF downloads?

□ Test crypto checkout:
  → Click crypto button
  → Redirects to Coinbase Commerce?

□ Test on mobile:
  → Open site on your phone
  → Everything looks good?
  → Checkout works on mobile?
```

---

## BLOCK 5: Meta Ads Setup (Hours 8-12)

```
□ Create/verify Meta Business Manager account
  → business.facebook.com

□ Create Facebook Page for "The Reluctant Seller"
  → Profile picture: Money tree logo
  → Cover photo: "Stop Selling. Start Letting People Buy."
  → About: Brief description of the product

□ Create/connect Instagram Business account
  → Set profile picture (money tree logo)
  → Write bio: "Close more by pushing less. Free simulator ↓"
  → Add website link

□ Set up Meta Pixel:
  → Create pixel in Events Manager
  → Get Pixel ID
  → I'll add the code to your website
  → Deploy the updated code

□ Create Custom Audiences:
  → Website visitors (all, last 30 days)
  → Simulator page visitors (last 30 days)
  → Landing page visitors who didn't purchase (last 14 days)

□ Create ad creatives:
  → Open Canva (canva.com)
  → Create 1080x1080 images for each creative brief
  → Create 1080x1920 story versions
  → Export as PNG

□ Set up Campaign 1: "Awareness — Simulator Hook"
  → Objective: Traffic
  → Budget: $30/day
  → Audience: Interests-based targeting
  → Upload creative 1
  → Add UTM parameters to URL

□ Set up Campaign 2: "Awareness — Philosophy"
  → Objective: Traffic
  → Budget: $30/day
  → Audience: Interests-based targeting
  → Upload creative 2
  → Add UTM parameters

□ Set up Campaign 3: "Retarget"
  → Objective: Sales/Conversions
  → Budget: $20/day
  → Audience: Website visitors custom audience
  → Upload creative 5
  → Add UTM parameters

□ Submit all ads for review
  → Usually approved within 24 hours
```

---

## BLOCK 6: Go Live (Hours 12-16)

```
□ Switch Stripe to LIVE mode:
  → Get live API keys
  → Update .env on VPS
  → Create live webhook endpoint
  → Restart app: pm2 restart reluctant-seller

□ Make a REAL test purchase:
  → Buy with your own card ($88 lifetime)
  → Verify everything works end-to-end
  → Refund yourself in Stripe Dashboard

□ Final checks:
  → SSL padlock showing in browser? ✅
  → All pages load quickly? ✅
  → Payment flow smooth? ✅
  → Email generator working? ✅
  → Mobile looks good? ✅

□ Set up uptime monitoring:
  → Go to uptimerobot.com
  → Add your URL
  → Set up email alerts

□ Activate ad campaigns (or they'll activate on schedule)

□ Share on personal channels:
  → LinkedIn post about the launch
  → Tweet / X post
  → Any relevant communities or groups

□ CELEBRATE! 🎉 You're live!
```

---

## BLOCK 7: First 24 Hours After Launch

```
□ Check ad performance every 4-6 hours:
  → Are ads running? (sometimes they get stuck in review)
  → Any clicks coming in?
  → Check CPC (cost per click)

□ Monitor website:
  → Check PM2 logs: pm2 logs
  → Any errors?
  → Site still up?

□ Check Stripe Dashboard:
  → Any payments?
  → Any failed charges?
  → Any disputes?

□ Check Meta Pixel:
  → Events firing correctly?
  → PageView events showing up?
  → Any Purchase events?

□ Respond to any questions/emails promptly
```

---

## Emergency Contacts / Resources

| Issue | Where to Get Help |
|-------|------------------|
| Website down | Check PM2: `pm2 status` then `pm2 restart all` |
| Payment issues | Stripe Dashboard → Support chat |
| VPS access issues | Hostinger Support → Live chat |
| Ad rejected | Check Meta's Ad Policy, edit and resubmit |
| Domain not working | Hostinger hPanel → DNS settings |
