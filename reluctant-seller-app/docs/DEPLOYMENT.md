# Deployment Guide

Step-by-step guide to deploying The Reluctant Seller on a VPS (Ubuntu 22.04). This covers the current production setup on Hostinger.

---

## Current Production Details

| Item | Value |
|------|-------|
| VPS Provider | Hostinger |
| VPS IP | `147.93.36.169` |
| OS | Ubuntu 22.04 |
| Domain | `reluctant.work` |
| DNS Provider | GoDaddy |
| App Directory | `/var/www/reluctant-seller` (or wherever you cloned) |
| App Port | `3000` (Next.js default) |
| Public Ports | `80` (HTTP), `443` (HTTPS), `22` (SSH) |

---

## Option 1: Automated Deployment

A full deployment script is included. It installs everything and configures the server.

```bash
# SSH into your VPS
ssh root@147.93.36.169

# Download and run the deploy script
# (or copy-paste the contents of deploy/ONE-COMMAND-DEPLOY.sh)
chmod +x deploy/ONE-COMMAND-DEPLOY.sh
./deploy/ONE-COMMAND-DEPLOY.sh
```

This script:
1. Updates system packages
2. Installs Node.js 20, PM2, Nginx, Certbot, Fail2Ban, UFW
3. Configures firewall (allows ports 22, 80, 443)
4. Sets up Fail2Ban for SSH protection
5. Prompts you to upload app files
6. Creates a `.env` template (you still need to fill in real keys)
7. Runs `npm install` and `npm run build`
8. Starts the app with PM2
9. Configures Nginx as reverse proxy
10. Sets up SSL with Let's Encrypt

---

## Option 2: Manual Step-by-Step

### Step 1: System Setup

```bash
# Update packages
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x

# Install PM2 (keeps app running)
npm install -g pm2

# Install Nginx + security tools
apt install -y nginx certbot python3-certbot-nginx fail2ban ufw git
```

### Step 2: Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw --force enable

# Verify
ufw status
```

### Step 3: Clone the App

```bash
cd /var/www
git clone https://github.com/steelclutchsean/reluc.git
cd reluc/reluctant-seller-app
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

Fill in ALL the values. See [ENV.md](ENV.md) for what each variable does and where to find it.

**Critical variables for the site to load at all:**
- `STRIPE_SECRET_KEY` — needed for checkout
- `NEXT_PUBLIC_APP_URL` — set to `https://reluctant.work` (or your domain)
- `JWT_SECRET` — generate with `openssl rand -hex 32`

### Step 5: Build and Start

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build

# Start with PM2
pm2 start npm --name "reluctant-seller" -- start

# Save PM2 config so it restarts on reboot
pm2 save

# Set up auto-start on server boot
pm2 startup
# (Copy and run the command it outputs)
```

### Step 6: Verify the App is Running

```bash
# Check PM2 status
pm2 status

# Should show:
# ┌────────────────────┬────┬─────────┬───────┐
# │ name               │ id │ status  │ cpu   │
# ├────────────────────┼────┼─────────┼───────┤
# │ reluctant-seller   │ 0  │ online  │ 0%    │
# └────────────────────┴────┴─────────┴───────┘

# Test locally
curl http://localhost:3000
# Should return HTML content

# Check logs if something's wrong
pm2 logs reluctant-seller
```

### Step 7: Configure Nginx

Create the Nginx config:

```bash
nano /etc/nginx/sites-available/reluctant-seller
```

Paste this config (or run `deploy/configure-nginx.sh`):

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=checkout:10m rate=2r/s;

server {
    listen 80;
    server_name reluctant.work www.reluctant.work;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Checkout routes (strict rate limit)
    location /api/checkout {
        limit_req zone=checkout burst=5 nodelay;
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

    location /api/crypto-checkout {
        limit_req zone=checkout burst=5 nodelay;
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

    # Other API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
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

    # All other routes (pages, static files)
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

Enable the site:

```bash
# Create symlink to enable the site
ln -sf /etc/nginx/sites-available/reluctant-seller /etc/nginx/sites-enabled/

# Remove default Nginx page
rm -f /etc/nginx/sites-enabled/default

# Test config for syntax errors
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 8: Set Up SSL (HTTPS)

**Prerequisite:** Your DNS must be pointing to the VPS IP first. Check with:
```bash
dig reluctant.work
# Should show 147.93.36.169
```

Then run Certbot:

```bash
certbot --nginx -d reluctant.work -d www.reluctant.work \
  --non-interactive --agree-tos --email admin@reluctant.work --redirect
```

This:
- Gets a free SSL certificate from Let's Encrypt
- Automatically modifies your Nginx config to handle HTTPS
- Sets up HTTP → HTTPS redirect

Set up auto-renewal:

```bash
# Add cron job for auto-renewal (runs twice daily)
(crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet") | crontab -
```

---

## DNS Setup (GoDaddy)

In GoDaddy DNS management for `reluctant.work`:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `147.93.36.169` | 600 |
| A | www | `147.93.36.169` | 600 |

DNS changes can take up to 48 hours to propagate, but usually complete within 15-30 minutes.

---

## Common PM2 Commands

```bash
pm2 status                        # Check if app is running
pm2 logs reluctant-seller         # View real-time logs
pm2 logs reluctant-seller --lines 100  # View last 100 log lines
pm2 restart reluctant-seller      # Restart the app
pm2 stop reluctant-seller         # Stop the app
pm2 delete reluctant-seller       # Remove from PM2
pm2 monit                         # Real-time monitoring dashboard
```

---

## Updating the App

When you push new code to GitHub:

```bash
# On the VPS
cd /var/www/reluc/reluctant-seller-app   # or wherever you cloned

# Pull latest code
git pull origin main

# Reinstall dependencies (in case package.json changed)
npm install

# Rebuild
npm run build

# Restart
pm2 restart reluctant-seller
```

---

## Nginx Common Commands

```bash
nginx -t                    # Test config for syntax errors
systemctl restart nginx     # Restart Nginx
systemctl status nginx      # Check if Nginx is running
tail -f /var/log/nginx/error.log    # View Nginx error logs
tail -f /var/log/nginx/access.log   # View access logs
```
