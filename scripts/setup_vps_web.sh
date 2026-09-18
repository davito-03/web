#!/bin/bash

# Configuration
DOMAIN="davito.es"     # Replace with your domain if different
WEB_ROOT="/var/www/html/davito"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}--- Auto-Setup for Web Hosting (Nginx + PHP) ---${NC}"
echo "Use this script on a fresh Ubuntu 20.04/22.04 VPS."
echo "Domain: $DOMAIN"
echo "Web Root: $WEB_ROOT"
echo "--------------------------------------------------------"
sleep 2

# 1. System Update
echo -e "${GREEN}[1/6] Updating System...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Dependencies
echo -e "${GREEN}[2/6] Installing Nginx, PHP, and Unzip...${NC}"
sudo apt-get install -y nginx unzip php-fpm php-common php-mbstring php-xml php-curl acl

# Detect PHP Version
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "Detected PHP Version: $PHP_VERSION"

# 3. Setup Web Directory
echo -e "${GREEN}[3/6] Setting up Directory Structure...${NC}"
sudo mkdir -p $WEB_ROOT
# Set permissions (assuming standard www-data for Nginx)
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT
# Add current user to group for easier file uploads
sudo usermod -a -G www-data $USER
sudo chmod g+s $WEB_ROOT

# 4. Configure Nginx
echo -e "${GREEN}[4/6] Configuring Nginx...${NC}"
CONFIG_FILE="/etc/nginx/sites-available/$DOMAIN"

sudo bash -c "cat > $CONFIG_FILE" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.html index.php;

    # Image caching (WebP/Images)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # ============ BLOCK SENSITIVE FILES ============
    # Block dotfiles (except .well-known for Certbot)
    location ~ /\.(?!well-known) {
        deny all;
        return 404;
    }

    # Block Python, shell scripts, config files, tokens
    location ~* \.(py|sh|ini|env|log|bak|sql|md|txt)$ {
        deny all;
        return 404;
    }

    # Allow robots.txt (override .txt block)
    location = /robots.txt {
        allow all;
        try_files \$uri =404;
    }

    # Allow games_history.json for Discord status widget
    location = /data/games_history.json {
        allow all;
        expires 60s;
        add_header Cache-Control "public, max-age=60";
    }

    # Block data directory (contains subscriptions, tokens, configs)
    location ^~ /data/ {
        deny all;
        return 404;
    }

    # Block scripts directory
    location ^~ /scripts/ {
        deny all;
        return 404;
    }

    # Main location
    location / {
        try_files \$uri \$uri/ =404;
    }

    # PHP Handling
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
    }

    # Security Headers
    add_header X-Frame-Options "DENY";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Enable site
sudo ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 5. Security (UFW)
echo -e "${GREEN}[5/6] Enabling Firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
# sudo ufw enable 

# 6. Certbot Instructions
echo -e "${GREEN}[6/6] Done! Next Steps:${NC}"
echo "1. Upload your website files to: $WEB_ROOT"
echo "2. Run: sudo apt-get install -y certbot python3-certbot-nginx"
echo "3. Run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "Migration Script Completed Successfully."
