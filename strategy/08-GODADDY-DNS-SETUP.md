# 08 — GoDaddy DNS Setup for reluctant.work

**Goal:** Point your `reluctant.work` domain (purchased on GoDaddy) to your Hostinger VPS.

---

## Step-by-Step Instructions

### Step 1: Get Your VPS IP Address

After purchasing your Hostinger VPS, you'll receive an email with your server's IP address. It looks something like: `123.456.78.90`

Write this down — you'll need it in the next step.

### Step 2: Log Into GoDaddy

1. Go to [godaddy.com](https://godaddy.com) and sign in
2. Click **"My Products"** (top right menu)
3. Find `reluctant.work` in your domains list
4. Click **"DNS"** or **"Manage DNS"** next to the domain

### Step 3: Update DNS Records

You'll see a table of DNS records. Make these changes:

**Edit the existing A record:**
1. Find the row where **Type** = `A` and **Name** = `@`
2. Click the pencil/edit icon
3. Change **Value** to your VPS IP address (e.g., `123.456.78.90`)
4. Set **TTL** to `600` (10 minutes, for faster propagation during setup)
5. Click **Save**

**Add a www A record (if it doesn't exist):**
1. Click **"Add Record"**
2. Type: `A`
3. Name: `www`
4. Value: Your VPS IP address (same as above)
5. TTL: `600`
6. Click **Save**

### Step 4: Remove Any Conflicting Records

If you see any of these, delete them (they can interfere):
- A `CNAME` record for `www` pointing to something else
- A "parked" or "forwarding" record from GoDaddy

### Step 5: Verify DNS Propagation

DNS changes can take 5-30 minutes (sometimes up to 48 hours, but usually fast).

**To check if it's working:**

On your computer, open Terminal (Mac) or Command Prompt (Windows) and type:
```
ping reluctant.work
```

If it shows your VPS IP address, DNS is working. If it shows a GoDaddy IP or doesn't resolve, wait a bit longer.

**Or use an online tool:**
Go to [dnschecker.org](https://dnschecker.org) and enter `reluctant.work` to see if it resolves to your VPS IP worldwide.

### Step 6: After DNS Propagates

Once `reluctant.work` points to your VPS, go back to your VPS terminal and run the SSL setup:

```bash
chmod +x /var/www/reluctant-seller/deploy/configure-nginx.sh
/var/www/reluctant-seller/deploy/configure-nginx.sh
```

This will automatically get your SSL certificate and configure everything.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| DNS not propagating | Wait 30 min. Clear your browser cache. Try incognito window. |
| "Server IP address could not be found" | DNS hasn't propagated yet. Check dnschecker.org |
| GoDaddy shows "parked" page | Remove any forwarding/parking settings in GoDaddy DNS |
| SSL fails with "DNS not pointing" | Wait for DNS propagation, then re-run certbot |

---

## Final DNS Records Should Look Like This:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | [Your VPS IP] | 600 |
| A | www | [Your VPS IP] | 600 |

That's it — just these two records are needed.
