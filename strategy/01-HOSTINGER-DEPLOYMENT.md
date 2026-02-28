# 01 — Hostinger Deployment Guide

**Goal:** Get The Reluctant Seller app live on a custom domain via Hostinger, with SSL encryption.

---

## Hosting Option Recommendation

### Option A: Hostinger VPS (Recommended for this app)
- **Why:** Your app runs on Node.js (Next.js), which needs a server that can run JavaScript on the backend. A VPS gives you full control.
- **Plan:** KVM 1 (~$6-8/month) — 1 vCPU, 4GB RAM, 50GB SSD
- **What it means:** You get your own mini-computer in the cloud that runs your app 24/7.

### Option B: Hostinger Cloud Hosting
- **Why:** Easier to manage, but less flexibility for Node.js apps.
- **Plan:** Cloud Startup (~$10/month)
- **What it means:** Hostinger manages the server for you, but you have less control over how Node.js runs.

### My Recommendation: **Go with Option A (VPS KVM 1)** — it's cheaper and gives us exactly what we need.

---

## Step-by-Step Setup

### STEP 1: Buy a Domain + VPS on Hostinger

1. Go to [hostinger.com](https://hostinger.com)
2. Click **"VPS Hosting"** in the top menu
3. Select **"KVM 1"** plan (cheapest one, plenty for this app)
4. During checkout:
   - Choose **Ubuntu 22.04** as the operating system
   - Pick the data center closest to your target audience (US if selling to Americans)
   - Add a domain if you don't already have one
5. Complete payment
6. You'll receive an email with your VPS login details (IP address, root password)

### STEP 2: Point Your Domain to the VPS

1. Log into Hostinger's **hPanel** (their control panel)
2. Go to **Domains** → click your domain
3. Go to **DNS / Nameservers**
4. Add an **A Record**:
   - **Name:** `@` (this means the main domain, like thereluctantseller.com)
   - **Points to:** Your VPS IP address (from the email they sent you)
   - **TTL:** 14400
5. Add another **A Record**:
   - **Name:** `www`
   - **Points to:** Same VPS IP address
   - **TTL:** 14400
6. Save. DNS changes can take 5-30 minutes to propagate (sometimes up to 24 hours, but usually fast).

### STEP 3: Connect to Your VPS

**What this means:** You're going to type commands into a remote computer (your VPS). It's like texting instructions to a robot.

**On Mac:**
1. Open the **Terminal** app (search for it in Spotlight)
2. Type: `ssh root@YOUR_VPS_IP_ADDRESS`
3. Enter the password from your email when prompted
4. You're now connected!

**On Windows:**
1. Download and install [PuTTY](https://putty.org) (free)
2. Open PuTTY
3. In "Host Name" field, type your VPS IP address
4. Click "Open"
5. Login as `root` with the password from your email

### STEP 4: Set Up the Server

Once connected to your VPS, copy and paste these commands one at a time. Each command does something specific — I've explained what each one does:

```bash
# Update the server's software (like updating apps on your phone)
apt update && apt upgrade -y

# Install Node.js 20 (this is what runs your website)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (keeps your website running even if the server restarts)
npm install -g pm2

# Install Nginx (this is the "front door" that directs visitors to your app)
apt install -y nginx

# Install Certbot (this gives you free SSL — the padlock icon in the browser)
apt install -y certbot python3-certbot-nginx

# Create a folder for your website
mkdir -p /var/www/reluctant-seller
```

### STEP 5: Upload Your App to the VPS

**From your local computer** (not the VPS), open a NEW terminal window and run:

```bash
# This copies your app files to the server
# Replace YOUR_VPS_IP with your actual IP address
scp -r /path/to/reluctant-seller-app/* root@YOUR_VPS_IP:/var/www/reluctant-seller/
```

**Note:** I'll prepare the exact files and path for you. The app needs to be built first.

### STEP 6: Build and Start the App on the VPS

Back in your VPS terminal:

```bash
# Go to the app folder
cd /var/www/reluctant-seller

# Install all the app's dependencies (like installing required apps)
npm install

# Create the environment file (this stores your secret API keys)
nano .env
```

When the text editor opens, paste in your API keys (I'll give you the exact format):

```
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_PRICE_ID=price_your_monthly_price_id
STRIPE_LIFETIME_PRICE_ID=price_your_lifetime_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
COINBASE_API_KEY=your_coinbase_api_key
CLAUDE_API_KEY=sk-ant-your_claude_api_key
JWT_SECRET=generate_a_random_64_character_string
NEXT_PUBLIC_BASE_URL=https://reluctant.work
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Build the app (compiles everything for production)
npm run build

# Start the app with PM2 (keeps it running forever)
pm2 start npm --name "reluctant-seller" -- start

# Make PM2 restart the app if the server reboots
pm2 startup
pm2 save
```

### STEP 7: Configure Nginx (The Front Door)

```bash
# Open the Nginx configuration file
nano /etc/nginx/sites-available/reluctant-seller
```

Paste this configuration (replace `reluctant.work` with your actual domain):

```nginx
server {
    listen 80;
    server_name reluctant.work www.reluctant.work;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Enable the site (creates a shortcut so Nginx knows about it)
ln -s /etc/nginx/sites-available/reluctant-seller /etc/nginx/sites-enabled/

# Remove the default site
rm /etc/nginx/sites-enabled/default

# Test that the configuration is correct
nginx -t

# Restart Nginx to apply changes
systemctl restart nginx
```

### STEP 8: Set Up SSL (The Padlock / HTTPS)

```bash
# Get a free SSL certificate (this makes your site secure with https://)
certbot --nginx -d reluctant.work -d www.reluctant.work
```

Certbot will ask you a few questions:
- Enter your email address (for renewal reminders)
- Agree to the terms of service (type `Y`)
- Choose to redirect HTTP to HTTPS (option 2 — recommended)

**That's it!** Your site should now be live at `https://reluctant.work`

### STEP 9: Set Up Auto-Renewal for SSL

```bash
# Test that auto-renewal works
certbot renew --dry-run

# Set up a cron job to auto-renew (runs twice daily)
crontab -e
# Add this line at the bottom:
# 0 0,12 * * * certbot renew --quiet
```

---

## Verifying Everything Works

After completing all steps, test these URLs:
- `https://reluctant.work` — Should show the landing page
- `https://reluctant.work/dashboard` — Should show "Access Required"
- `https://reluctant.work/simulator.html` — Should show the interactive simulator
- `https://reluctant.work/The_Reluctant_Seller.pdf` — Should download the PDF

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check PM2 is running: `pm2 status` |
| "502 Bad Gateway" | App crashed. Check logs: `pm2 logs reluctant-seller` |
| Domain not working | DNS hasn't propagated. Wait 30 min, or check with `ping reluctant.work` |
| SSL not working | Re-run `certbot --nginx -d reluctant.work` |
| App won't build | Check .env file has all required keys |

---

## Quick Reference Commands

```bash
# Check if app is running
pm2 status

# View app logs (see errors in real time)
pm2 logs reluctant-seller

# Restart the app (after code changes)
pm2 restart reluctant-seller

# Rebuild after code changes
cd /var/www/reluctant-seller && npm run build && pm2 restart reluctant-seller
```
