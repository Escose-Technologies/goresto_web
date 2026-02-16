#!/bin/bash
set -e

COMPOSE_FILE=${1:-docker-compose.staging.yml}

echo "=== Goresto Deployment ==="
echo "Using compose file: $COMPOSE_FILE"

echo ""
echo "1. Pulling latest code..."
git pull origin feature-be-implementation

echo ""
echo "2. Building frontend..."
npm install
npm run build

echo ""
echo "3. Building Docker images (backend)..."
docker compose -f "$COMPOSE_FILE" build

echo ""
echo "4. Running database migrations..."
docker compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy --schema=prisma/schema.prisma

echo ""
echo "5. Restarting services..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "6. Waiting for health check..."
sleep 10

if curl -sf http://localhost/api/health > /dev/null 2>&1 || curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "Health check passed!"
else
  echo "WARNING: Health check failed. Check logs with: docker compose -f $COMPOSE_FILE logs app"
fi

echo ""
echo "=== Deployment complete ==="
echo "View logs: docker compose -f $COMPOSE_FILE logs -f"
