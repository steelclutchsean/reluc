#!/bin/bash
# ============================================================
# The Reluctant Seller — VPS Setup Script
# Run this on a fresh Ubuntu 22.04 VPS (Hostinger KVM 1)
#
# USAGE:
#   1. SSH into your VPS:  ssh root@YOUR_VPS_IP
#   2. Upload this file:   scp deploy/setup-vps.sh root@YOUR_VPS_IP:/root/
#   3. Make executable:    chmod +x /root/setup-vps.sh
#   4. Run it:             /root/setup-vps.sh
# ============================================================

set -e  # Stop on any error

DOMAIN="reluctant.work"
APP_DIR="/var/www/reluctant-seller"
SSH_PORT=2847

echo ""
echo "=========================================="
echo "  The Reluctant Seller — VPS Setup"
echo "  Domain: $DOMAIN"
echo "=========================================="
echo ""

# ---- STEP 1: System Updates ----
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# ---- STEP 2: Install Node.js 20 ----
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ---- STEP 3: Install PM2 ----
echo "[3/8] Installing PM2 (process manager)..."
npm install -g pm2

# ---- STEP 4: Install Nginx ----
echo "[4/8] Installing Nginx..."
apt install -y nginx

# ---- STEP 5: Install security tools ----
echo "[5/8] Installing security tools (Certbot, Fail2Ban, UFW)..."
apt install -y certbot python3-certbot-nginx fail2ban ufw unattended-upgrades

# ---- STEP 6: Configure firewall ----
echo "[6/8] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp      # Keep default SSH open until we confirm new port works
ufw allow $SSH_PORT/tcp
ufw --force enable

# ---- STEP 7: Configure Fail2Ban ----
echo "[7/8] Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
FAIL2BAN
systemctl restart fail2ban

# ---- STEP 8: Create app directory ----
echo "[8/8] Creating app directory..."
mkdir -p $APP_DIR

echo ""
echo "=========================================="
echo "  Base setup complete!"
echo ""
echo "  NEXT STEPS:"
echo "  1. Upload your app files to $APP_DIR"
echo "  2. Run: cd $APP_DIR && npm install && npm run build"
echo "  3. Run the configure-nginx.sh script"
echo "=========================================="
echo ""
