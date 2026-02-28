#!/bin/bash
# ============================================================
# The Reluctant Seller — Nginx + SSL Configuration
# Run this AFTER setup-vps.sh and after uploading your app
#
# PREREQUISITES:
#   - DNS A records for reluctant.work pointing to this VPS IP
#   - App files uploaded to /var/www/reluctant-seller
#   - App built and running via PM2
# ============================================================

set -e

DOMAIN="reluctant.work"
APP_DIR="/var/www/reluctant-seller"

echo ""
echo "=========================================="
echo "  Configuring Nginx for $DOMAIN"
echo "=========================================="
echo ""

# ---- Create Nginx config ----
echo "[1/4] Creating Nginx configuration..."
cat > /etc/nginx/sites-available/reluctant-seller << NGINX_CONF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=checkout:10m rate=2r/s;

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://commerce.coinbase.com https://connect.facebook.net; frame-src https://js.stripe.com https://commerce.coinbase.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.commerce.coinbase.com https://api.anthropic.com https://www.facebook.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes with rate limiting
    location /api/checkout {
        limit_req zone=checkout burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/crypto-checkout {
        limit_req zone=checkout burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # All other routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONF

# ---- Enable site ----
echo "[2/4] Enabling site..."
ln -sf /etc/nginx/sites-available/reluctant-seller /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# ---- Test and restart Nginx ----
echo "[3/4] Testing Nginx configuration..."
nginx -t
systemctl restart nginx

# ---- Set up SSL ----
echo "[4/4] Setting up SSL certificate..."
echo ""
echo "  IMPORTANT: Make sure your DNS is pointing to this server!"
echo "  Running certbot now..."
echo ""
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# ---- Set up auto-renewal ----
echo "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet") | crontab -

echo ""
echo "=========================================="
echo "  Nginx + SSL configured!"
echo ""
echo "  Your site is now live at:"
echo "  https://$DOMAIN"
echo ""
echo "  SSL auto-renewal: enabled"
echo "  Rate limiting: enabled"
echo "  Security headers: enabled"
echo "=========================================="
echo ""
