#!/bin/bash
# setup_vps_proxy.sh
# Automates Nginx + Certbot setup for DaBot API
DOMAIN="api.davito.es"
EMAIL="admin@davito.es" # Change this if you want
BOT_PORT=8080
echo "--- DaBot VPS Proxy Setup ---"
echo "Target Domain: $DOMAIN"
echo "Bot Port: $BOT_PORT"
echo "-----------------------------"
# 1. Update and Install Nginx & Certbot
echo "[1/4] Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
# 2. Create Nginx Configuration
echo "[2/4] Configuring Nginx..."
CONFIG_FILE="/etc/nginx/sites-available/$DOMAIN"
sudo bash -c "cat > $CONFIG_FILE" <<EOF
server {
    server_name $DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:$BOT_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
# Enable the site
sudo ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default # Remove default if it exists
sudo nginx -t # Test config
sudo systemctl reload nginx
# 3. Obtain SSL Certificate
echo "[3/4] Obtaining SSL Certificate..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
# 4. Firewall (UFW)
echo "[4/4] Configuring Firewall..."
sudo ufw allow 'Nginx Full'
echo "-----------------------------"
echo "Setup Complete!"
echo "Your API should now be accessible at https://$DOMAIN"
echo "-----------------------------"