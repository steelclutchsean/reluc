# Troubleshooting

Common issues and how to fix them. Organized by symptom.

---

## Site Won't Load at All

### Symptom: Browser shows "connection refused" or "this site can't be reached"

**Check 1: Is the app actually running?**

```bash
pm2 status
```

If it shows `stopped` or `errored`:
```bash
pm2 logs reluctant-seller --lines 50
# Look for the error, fix it, then:
pm2 restart reluctant-seller
```

If `pm2` command not found:
```bash
npm install -g pm2
cd /path/to/reluctant-seller-app
pm2 start npm --name "reluctant-seller" -- start
```

**Check 2: Is the app listening on port 3000?**

```bash
curl http://localhost:3000
```

If this works but the site doesn't load from outside, the issue is Nginx or firewall.

**Check 3: Is Nginx running?**

```bash
systemctl status nginx
```

If not running:
```bash
nginx -t          # Check for config errors
systemctl start nginx
```

**Check 4: Is the firewall blocking traffic?**

```bash
ufw status
```

You should see ports 80 and 443 as ALLOW. If not:
```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

**Check 5: Is port 3000 open? (for direct IP access)**

If you're testing via `http://147.93.36.169:3000`, the firewall needs to allow it:
```bash
ufw allow 3000/tcp    # Only for testing — remove after Nginx is working
```

---

### Symptom: Blank white page / no content renders

This usually means the Next.js build succeeded but something is wrong at runtime.

**Check 1: Was the app built?**

```bash
ls -la .next/
```

If `.next/` folder doesn't exist or is empty:
```bash
npm run build
pm2 restart reluctant-seller
```

**Check 2: Are there JavaScript errors?**

Open browser dev tools (F12 or Cmd+Option+I) → Console tab. Look for red errors.

Common causes:
- Missing environment variables (especially `NEXT_PUBLIC_*` ones that the browser needs)
- Build was done without `.env` file (NEXT_PUBLIC vars are baked in at build time)

**Fix:** Make sure `.env` exists before building:
```bash
# Check .env exists
cat .env

# If it's missing, create it
cp .env.example .env
nano .env   # Fill in your keys

# Rebuild (critical — NEXT_PUBLIC vars are embedded at build time)
npm run build
pm2 restart reluctant-seller
```

**Check 3: Are there server-side errors?**

```bash
pm2 logs reluctant-seller --lines 100
```

Look for lines starting with `Error:` or stack traces.

---

### Symptom: Site loads on IP:3000 but not on domain

**Check 1: DNS is pointing correctly**

```bash
dig reluctant.work
# Should show your VPS IP (147.93.36.169)

dig www.reluctant.work
# Should also show your VPS IP
```

If DNS isn't resolving, check GoDaddy DNS settings:
- A record: `@` → `147.93.36.169`
- A record: `www` → `147.93.36.169`

DNS changes can take 15-30 minutes (sometimes up to 48 hours).

**Check 2: Nginx is configured for your domain**

```bash
cat /etc/nginx/sites-enabled/reluctant-seller
```

Make sure the `server_name` line includes your domain:
```
server_name reluctant.work www.reluctant.work;
```

**Check 3: Nginx is proxying to the right port**

The config should have:
```
proxy_pass http://localhost:3000;
```

---

## Payment Issues

### Symptom: "Payment error. Please try again." when clicking checkout

**Check 1: Stripe keys are correct**

```bash
# Look at your .env
grep STRIPE .env
```

- `STRIPE_SECRET_KEY` must start with `sk_test_` (test) or `sk_live_` (production)
- `STRIPE_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` must be valid Price IDs from your Stripe dashboard

**Check 2: Price IDs exist in Stripe**

Go to [Stripe Dashboard](https://dashboard.stripe.com) > Products. Click your product. Check the Price IDs match what's in `.env`.

Common mistake: using a test mode Price ID with a live mode Secret Key (or vice versa). They must match.

**Check 3: Check server logs for the specific error**

```bash
pm2 logs reluctant-seller --lines 50
```

Look for lines containing `Stripe checkout error:`.

---

### Symptom: "Access Required" on dashboard after paying

This means the JWT cookie wasn't set properly after payment.

**Check 1: NEXT_PUBLIC_APP_URL matches your actual domain**

```bash
grep NEXT_PUBLIC_APP_URL .env
```

If this is set to `http://localhost:3000` in production, Stripe will redirect users to localhost after payment (not your real domain), so the cookie never gets set on your domain.

**Fix:**
```bash
# In .env, set to your actual domain:
NEXT_PUBLIC_APP_URL=https://reluctant.work
```

Then rebuild and restart:
```bash
npm run build
pm2 restart reluctant-seller
```

**Check 2: JWT_SECRET is set**

```bash
grep JWT_SECRET .env
```

If it's blank or still says `generate_with_openssl_rand_hex_32`:
```bash
# Generate a real secret
openssl rand -hex 32
# Paste the output as JWT_SECRET in .env
```

**Check 3: Cookie is being set correctly**

In browser dev tools > Application tab > Cookies. Look for `rs_token`. If it's not there after payment, the verify endpoint is failing.

Check server logs:
```bash
pm2 logs reluctant-seller | grep "Verify error"
```

---

### Symptom: Crypto checkout doesn't work

```bash
grep COINBASE .env
```

If `COINBASE_COMMERCE_API_KEY` is missing or placeholder, crypto checkout will fail. Either:
1. Set a valid API key from [Coinbase Commerce](https://commerce.coinbase.com)
2. Or remove the crypto button from `src/app/page.tsx` (search for "crypto")

---

## Email Generator Issues

### Symptom: "Generation failed. Please try again."

**Check 1: Anthropic API key**

```bash
grep ANTHROPIC .env
```

The key must start with `sk-ant-`. Get one from [console.anthropic.com](https://console.anthropic.com).

**Check 2: API credits**

Your Anthropic account needs credits. Each generation costs ~$0.01-$0.03. Check your balance at [console.anthropic.com](https://console.anthropic.com).

**Check 3: Server error logs**

```bash
pm2 logs reluctant-seller | grep "Generate error"
```

Common errors:
- `"Invalid API key"` — key is wrong
- `"Insufficient credits"` — add more credits to your Anthropic account
- `"Rate limit exceeded"` — too many requests, wait a moment

---

## Build Errors

### Symptom: `npm run build` fails

**Check 1: Node.js version**

```bash
node --version
```

Must be 18 or higher. If older:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

**Check 2: Dependencies installed**

```bash
npm install
```

If this fails with permissions errors:
```bash
# If running as root, this sometimes helps
npm install --unsafe-perm
```

**Check 3: TypeScript errors**

The build output will show the specific error. Common ones:
- Missing types — run `npm install` again
- Import errors — check file paths are correct (case-sensitive on Linux)

---

## SSL/HTTPS Issues

### Symptom: SSL certificate error in browser

**Check 1: Certificate exists**

```bash
certbot certificates
```

If no certificates listed:
```bash
certbot --nginx -d reluctant.work -d www.reluctant.work \
  --non-interactive --agree-tos --email admin@reluctant.work --redirect
```

**Check 2: Certificate expired**

```bash
certbot certificates
# Look at the "Expiry Date" line
```

If expired:
```bash
certbot renew
systemctl restart nginx
```

**Check 3: Certbot failed because DNS isn't ready**

Certbot needs to verify you own the domain. If DNS hasn't propagated yet:
```bash
dig reluctant.work
# If this doesn't show your VPS IP, wait for DNS propagation
```

---

## Quick Diagnostic Checklist

Run these commands to get a quick snapshot of your server state:

```bash
echo "=== Node.js ==="
node --version

echo "=== PM2 ==="
pm2 status

echo "=== Nginx ==="
systemctl status nginx --no-pager

echo "=== Firewall ==="
ufw status

echo "=== App Port ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

echo "=== .env exists ==="
ls -la /var/www/reluc/reluctant-seller-app/.env 2>/dev/null || echo "NOT FOUND"

echo "=== .next build exists ==="
ls -d /var/www/reluc/reluctant-seller-app/.next 2>/dev/null || echo "NOT FOUND"

echo "=== Recent errors ==="
pm2 logs reluctant-seller --lines 10 --nostream 2>/dev/null || echo "PM2 not running"
```
