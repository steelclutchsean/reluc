#!/bin/bash
# ============================================================
# THE RELUCTANT SELLER — ONE-COMMAND FULL DEPLOYMENT
#
# This script does EVERYTHING:
#   1. Installs Node.js 20, PM2, Nginx, Certbot
#   2. Sets up firewall + Fail2Ban
#   3. Downloads and builds the app
#   4. Configures Nginx with security headers
#   5. Sets up SSL (https://)
#   6. Starts the app
#
# HOW TO USE:
#   1. SSH into your VPS:  ssh deployer@147.93.36.169
#   2. Switch to root:     sudo su
#   3. Paste this ENTIRE script and press Enter
#   4. Wait ~5 minutes
#   5. Your site will be live at https://reluctant.work
#
# ============================================================

set -e
DOMAIN="reluctant.work"
APP_DIR="/var/www/reluctant-seller"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  THE RELUCTANT SELLER — FULL DEPLOYMENT  ║"
echo "║  Domain: $DOMAIN                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ============================================================
# PHASE 1: SYSTEM SETUP
# ============================================================
echo "▸ [1/9] Updating system..."
apt update -y && apt upgrade -y

echo "▸ [2/9] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "▸ [3/9] Installing PM2, Nginx, security tools..."
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx fail2ban ufw unattended-upgrades git

# ============================================================
# PHASE 2: SECURITY
# ============================================================
echo "▸ [4/9] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Fail2Ban
cat > /etc/fail2ban/jail.local << 'F2B'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
F2B
systemctl restart fail2ban

# Auto security updates
dpkg-reconfigure --priority=low unattended-upgrades -f noninteractive 2>/dev/null || true

# ============================================================
# PHASE 3: APP DEPLOYMENT
# ============================================================
echo "▸ [5/9] Creating app directory..."
mkdir -p $APP_DIR

echo ""
echo "═══════════════════════════════════════════"
echo "  Now you need to upload the app files."
echo ""
echo "  OPEN A NEW TERMINAL on your computer"
echo "  and run this command:"
echo ""
echo "  scp -r /path/to/reluctant-seller-app/* deployer@147.93.36.169:/tmp/rs-upload/"
echo ""
echo "  Then come back here and press Enter."
echo "═══════════════════════════════════════════"
echo ""
echo "  OR — if you have git, we can clone from a repo."
echo "  For now, press Enter once files are uploaded..."
read -p ""

# Move files from upload location
if [ -d "/tmp/rs-upload" ]; then
    cp -r /tmp/rs-upload/* $APP_DIR/
    echo "  Files copied from /tmp/rs-upload"
elif [ -d "/home/deployer/reluctant-seller-app" ]; then
    cp -r /home/deployer/reluctant-seller-app/* $APP_DIR/
    echo "  Files copied from /home/deployer/reluctant-seller-app"
else
    echo "  Looking for files..."
    # Try common locations
    for dir in /root/reluctant-seller-app /home/deployer/app /tmp/app; do
        if [ -d "$dir" ]; then
            cp -r $dir/* $APP_DIR/
            echo "  Files copied from $dir"
            break
        fi
    done
fi

cd $APP_DIR

# Check package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in $APP_DIR"
    echo "Please upload the app files and run this script again."
    exit 1
fi

# ============================================================
# PHASE 4: ENVIRONMENT VARIABLES
# ============================================================
echo "▸ [6/9] Setting up environment variables..."

if [ ! -f ".env" ]; then
    # Generate a strong JWT secret
    JWT_SECRET=$(openssl rand -hex 32)

    cat > .env << ENVFILE
# Stripe (REPLACE THESE WITH YOUR REAL KEYS)
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_PRICE_ID=price_REPLACE_ME_MONTHLY
STRIPE_LIFETIME_PRICE_ID=price_REPLACE_ME_LIFETIME
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME

# Coinbase Commerce
COINBASE_COMMERCE_API_KEY=REPLACE_ME

# Claude AI (for email generator)
ANTHROPIC_API_KEY=sk-ant-REPLACE_ME

# App
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_BASE_URL=https://$DOMAIN
JWT_SECRET=$JWT_SECRET

# Meta Pixel (add after creating in Meta Events Manager)
# NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id
ENVFILE

    echo ""
    echo "═══════════════════════════════════════════"
    echo "  .env file created with placeholder keys."
    echo "  JWT_SECRET has been auto-generated."
    echo ""
    echo "  IMPORTANT: You MUST edit .env with your"
    echo "  real API keys before the site will work."
    echo ""
    echo "  Run:  nano $APP_DIR/.env"
    echo "═══════════════════════════════════════════"
    echo ""
fi

# ============================================================
# PHASE 5: BUILD
# ============================================================
echo "▸ [7/9] Installing dependencies and building..."
npm install
npm run build

# ============================================================
# PHASE 6: START APP
# ============================================================
echo "▸ [8/9] Starting app with PM2..."
pm2 delete reluctant-seller 2>/dev/null || true
pm2 start npm --name "reluctant-seller" -- start
pm2 save
pm2 startup 2>/dev/null || true

# ============================================================
# PHASE 7: NGINX + SSL
# ============================================================
echo "▸ [9/9] Configuring Nginx + SSL..."

cat > /etc/nginx/sites-available/reluctant-seller << 'NGINX'
# Rate limiting
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
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://commerce.coinbase.com https://connect.facebook.net; frame-src https://js.stripe.com https://commerce.coinbase.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.commerce.coinbase.com https://api.anthropic.com https://www.facebook.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

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
NGINX

ln -sf /etc/nginx/sites-available/reluctant-seller /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# SSL
echo ""
echo "Setting up SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect || {
    echo ""
    echo "⚠ SSL setup failed — DNS may not be propagated yet."
    echo "  Run this later:  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}

# Auto-renew SSL
(crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet") | sort -u | crontab -

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║                                          ║"
echo "║   DEPLOYMENT COMPLETE!                   ║"
echo "║                                          ║"
echo "║   Your site: https://reluctant.work      ║"
echo "║                                          ║"
echo "║   NEXT STEPS:                            ║"
echo "║   1. Edit .env with real API keys:       ║"
echo "║      nano /var/www/reluctant-seller/.env  ║"
echo "║   2. Restart after editing:              ║"
echo "║      pm2 restart reluctant-seller        ║"
echo "║   3. Test the site in your browser       ║"
echo "║                                          ║"
echo "║   USEFUL COMMANDS:                       ║"
echo "║   pm2 status          — check if running ║"
echo "║   pm2 logs            — view error logs  ║"
echo "║   pm2 restart all     — restart app      ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
