#!/bin/bash
set -e

DOMAIN=${1}
EMAIL=${2}
COMPOSE_FILE=${3:-docker-compose.staging.yml}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: $0 <domain> <email> [compose-file]"
  echo ""
  echo "Example:"
  echo "  $0 api.goresto.com admin@goresto.com"
  echo "  $0 api.goresto.com admin@goresto.com docker-compose.prod.yml"
  exit 1
fi

echo "=== SSL Certificate Setup ==="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

echo ""
echo "1. Updating Nginx config with domain..."
# Update domain in Nginx config
NGINX_CONF="./nginx/staging.conf"
if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
  NGINX_CONF="./nginx/prod.conf"
fi

sed -i.bak "s/your-domain.com/$DOMAIN/g" "$NGINX_CONF"
rm -f "${NGINX_CONF}.bak"

echo ""
echo "2. Creating temporary Nginx config for ACME challenge..."
# Create a temporary config that only serves HTTP (no SSL yet)
cat > /tmp/nginx-acme.conf << 'TMPEOF'
server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 200 'Waiting for SSL setup...';
        add_header Content-Type text/plain;
    }
}
TMPEOF

# Temporarily use the ACME-only config
cp "$NGINX_CONF" "${NGINX_CONF}.full"
cp /tmp/nginx-acme.conf "$NGINX_CONF"

echo ""
echo "3. Starting Nginx for ACME challenge..."
docker compose -f "$COMPOSE_FILE" up -d nginx
sleep 3

echo ""
echo "4. Requesting certificate from Let's Encrypt..."
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d "$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email

echo ""
echo "5. Restoring full Nginx config with SSL..."
cp "${NGINX_CONF}.full" "$NGINX_CONF"
rm -f "${NGINX_CONF}.full"

echo ""
echo "6. Restarting Nginx with SSL..."
docker compose -f "$COMPOSE_FILE" restart nginx

echo ""
echo "=== SSL setup complete! ==="
echo "Your API is now available at: https://$DOMAIN"
echo ""
echo "Certificate auto-renewal is handled by the certbot container."
