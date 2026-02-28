# 02 — Security Hardening Plan

**Goal:** Protect The Reluctant Seller from hackers, secure all payments, and keep customer data safe.

---

## Security Layers Overview

Think of security like protecting a house. You don't just lock the front door — you also have window locks, an alarm system, and motion lights. We're doing the same thing for your website.

```
Layer 1: Server Security      — Locking the building itself
Layer 2: Application Security  — Protecting the rooms inside
Layer 3: Payment Security      — Vault for the money
Layer 4: Data Security         — Protecting customer information
Layer 5: Monitoring            — Security cameras
```

---

## Layer 1: Server Security (Your VPS)

### What we're protecting against:
Hackers trying to break into your server directly, like someone picking a lock.

### Actions to take:

**1. Change the default SSH port** (makes it harder for automated bots to find your server)
```bash
# On your VPS, edit the SSH config
nano /etc/ssh/sshd_config

# Find "Port 22" and change it to something random like:
Port 2847

# Save and restart SSH
systemctl restart sshd
```
**What this does:** By default, every server listens on port 22. Hackers know this and constantly scan for it. Changing it is like moving your front door to an unusual location.

**2. Set up a firewall** (only allow traffic through specific doors)
```bash
# Install UFW (Uncomplicated Firewall)
apt install -y ufw

# Allow your custom SSH port
ufw allow 2847/tcp

# Allow web traffic (HTTP and HTTPS)
ufw allow 80/tcp
ufw allow 443/tcp

# Enable the firewall
ufw enable

# Verify
ufw status
```
**What this does:** Blocks all connections except the ones your website actually needs. Like putting up a wall with only 3 doors.

**3. Install Fail2Ban** (automatically blocks repeated break-in attempts)
```bash
apt install -y fail2ban

# Create config
nano /etc/fail2ban/jail.local
```
Paste:
```
[sshd]
enabled = true
port = 2847
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```
```bash
systemctl restart fail2ban
```
**What this does:** If someone tries to guess your password 3 times, they get blocked for an hour. Like a bouncer who kicks out troublemakers.

**4. Disable root login** (create a safer admin account)
```bash
# Create a new user
adduser deployer
usermod -aG sudo deployer

# Test you can login as the new user (in a NEW terminal)
ssh -p 2847 deployer@YOUR_VPS_IP

# Once confirmed working, disable root login
sudo nano /etc/ssh/sshd_config
# Change: PermitRootLogin no
sudo systemctl restart sshd
```
**What this does:** Even if someone guesses the "root" username, they can't get in. You'll use your own username instead.

**5. Enable automatic security updates**
```bash
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```
**What this does:** Automatically installs security patches so your server stays protected against newly discovered vulnerabilities.

---

## Layer 2: Application Security (Your Website Code)

### What we're protecting against:
Hackers trying to exploit your website's code — injecting malicious scripts, overwhelming your server, or stealing data through the website itself.

### Actions to take:

**1. Security Headers** (I will add these to your Nginx config)

These headers tell browsers to be extra careful when loading your site:

```nginx
# Add these inside the server block in Nginx config
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://commerce.coinbase.com; frame-src https://js.stripe.com https://commerce.coinbase.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.commerce.coinbase.com https://api.anthropic.com;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**In plain English:**
- **X-Frame-Options:** Prevents other websites from embedding your site in a frame (stops clickjacking attacks)
- **X-Content-Type-Options:** Prevents browsers from guessing file types (stops certain injection attacks)
- **X-XSS-Protection:** Extra protection against cross-site scripting
- **Content-Security-Policy:** Only allows scripts/resources from trusted sources (Stripe, Coinbase, your domain)
- **Strict-Transport-Security:** Forces HTTPS for a full year — no unencrypted connections ever

**2. Rate Limiting** (prevents someone from flooding your server with requests)

Add to Nginx config:
```nginx
# At the top of nginx.conf (outside server block)
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=checkout:10m rate=2r/s;

# Inside your server block, for API routes
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}

# Stricter limit for checkout/payment routes
location /api/checkout {
    limit_req zone=checkout burst=5 nodelay;
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```

**In plain English:** This limits how many requests someone can make per second. Normal users won't notice, but attackers trying to overwhelm your server will get blocked. The checkout endpoint is extra strict — only 2 requests per second — to prevent payment abuse.

**3. Input Validation** (already built into the app)
- Email addresses are validated before processing
- All API routes check for required fields
- JWT tokens are verified on every protected request

**4. Environment Variables** (secret keys are never exposed)
- All API keys stored in `.env` file
- Never committed to version control
- Not accessible from the browser

---

## Layer 3: Payment Security

### Why this matters:
This is where real money flows. Payment security is non-negotiable.

### How Stripe Protects You:

**Stripe is PCI DSS Level 1 compliant** — this is the highest level of payment security certification. Here's what that means for you:

1. **Credit card numbers never touch your server.** When a customer enters their card info, it goes directly from their browser to Stripe's servers. Your server never sees the actual card number. This is the biggest security advantage.

2. **Stripe handles fraud detection.** Their Radar system uses machine learning trained on billions of transactions to detect fraudulent payments.

3. **Webhook signature verification.** When Stripe sends your server a notification (e.g., "payment succeeded"), it includes a cryptographic signature. Your app verifies this signature to make sure the notification actually came from Stripe and wasn't faked by a hacker. This is already built into your webhook route.

4. **3D Secure / SCA.** For European customers, Stripe automatically handles Strong Customer Authentication (that extra step where the bank sends a verification code).

### How Coinbase Commerce Protects You:

1. **Crypto payments are processed entirely by Coinbase.** Like Stripe, no sensitive financial data touches your server.
2. **Blockchain verification** ensures payments are legitimate and irreversible once confirmed.

### Additional Payment Security Steps:

```
✅ Already implemented in your code:
- Stripe webhook signature verification
- JWT-based session tokens with expiration
- HTTP-only cookies (can't be read by JavaScript)
- Separate verification for lifetime vs. subscription customers

📋 To add before launch:
- Enable Stripe Radar (free, automatic)
- Set up Stripe webhook endpoint in Stripe Dashboard
- Test with Stripe's test card numbers before going live
- Enable email receipts in Stripe Dashboard
```

---

## Layer 4: Data Security

### What customer data do we store?

| Data | Where Stored | Encrypted? |
|------|-------------|------------|
| Email address | Stripe (not on your server) | Yes (by Stripe) |
| Payment info | Stripe (never touches your server) | Yes (by Stripe) |
| Session token | HTTP-only cookie in browser | Yes (JWT signed) |
| Stripe customer ID | JWT token only | Yes (JWT signed) |

**Key point:** You're not storing any sensitive customer data on your server. Everything is either handled by Stripe or stored as encrypted tokens. This massively reduces your security risk.

### JWT Token Security:
- Tokens expire after 30 days (monthly) or ~10 years (lifetime)
- Signed with a secret key only you know
- Stored in HTTP-only cookies (invisible to JavaScript — hackers can't steal them with XSS attacks)
- Contains only: customer ID, lifetime flag, expiration — no sensitive personal data

---

## Layer 5: Monitoring (Security Cameras)

### Set up alerts so you know if something goes wrong:

**1. Monitor server health with PM2:**
```bash
# See real-time logs
pm2 logs

# Set up PM2 monitoring (free tier)
pm2 install pm2-logrotate
```

**2. Monitor Nginx access logs:**
```bash
# View recent visitors
tail -f /var/log/nginx/access.log

# View errors
tail -f /var/log/nginx/error.log
```

**3. Stripe Dashboard monitoring:**
- Enable email notifications for: successful payments, failed payments, disputes
- Check Stripe Dashboard daily for the first week

**4. Set up a free uptime monitor:**
- Go to [uptimerobot.com](https://uptimerobot.com) (free)
- Add your website URL
- It will check every 5 minutes and email/text you if your site goes down

---

## Security Checklist Before Launch

```
□ SSH port changed from 22
□ Firewall (UFW) enabled with only ports 80, 443, and custom SSH
□ Fail2Ban installed and configured
□ Root login disabled
□ Automatic security updates enabled
□ SSL certificate installed (https://)
□ Security headers added to Nginx
□ Rate limiting configured
□ Stripe webhook signature verification working
□ All API keys in .env file (not in code)
□ .env file not in version control
□ JWT secret is a strong random string (64+ characters)
□ HTTP-only cookies configured
□ Stripe Radar enabled
□ Uptime monitoring set up
□ Test all payment flows in test mode before going live
```

---

## If Something Goes Wrong

| Situation | What to Do |
|-----------|-----------|
| Suspicious login attempts | Check Fail2Ban: `fail2ban-client status sshd` |
| Server seems slow/under attack | Check Nginx logs, temporarily enable more aggressive rate limiting |
| Fraudulent payment | Handle through Stripe Dashboard (dispute tools) |
| Site goes down | Check PM2: `pm2 status`, restart if needed: `pm2 restart all` |
| Suspected breach | Change all passwords, rotate API keys, check server logs |
