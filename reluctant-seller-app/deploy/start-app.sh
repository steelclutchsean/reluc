#!/bin/bash
# ============================================================
# The Reluctant Seller — Build & Start App
# Run this after uploading files and creating .env
#
# USAGE:
#   cd /var/www/reluctant-seller
#   chmod +x deploy/start-app.sh
#   ./deploy/start-app.sh
# ============================================================

set -e

APP_DIR="/var/www/reluctant-seller"
cd $APP_DIR

echo ""
echo "=========================================="
echo "  Building & Starting The Reluctant Seller"
echo "=========================================="
echo ""

# ---- Check .env exists ----
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo ""
    echo "Create it first:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo "  (fill in your actual API keys)"
    echo ""
    exit 1
fi

# ---- Install dependencies ----
echo "[1/4] Installing dependencies..."
npm install --production=false

# ---- Build the app ----
echo "[2/4] Building for production..."
npm run build

# ---- Stop old instance if running ----
echo "[3/4] Stopping old instance (if any)..."
pm2 delete reluctant-seller 2>/dev/null || true

# ---- Start with PM2 ----
echo "[4/4] Starting app with PM2..."
pm2 start npm --name "reluctant-seller" -- start
pm2 save

# ---- Set up PM2 to start on boot ----
pm2 startup 2>/dev/null || true

echo ""
echo "=========================================="
echo "  App is running!"
echo ""
echo "  Check status:  pm2 status"
echo "  View logs:     pm2 logs reluctant-seller"
echo "  Restart:       pm2 restart reluctant-seller"
echo "=========================================="
echo ""
