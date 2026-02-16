#!/bin/bash
set -e

# Usage: ./scripts/migrate-from-neon.sh <NEON_DATABASE_URL>
# Example: ./scripts/migrate-from-neon.sh "postgresql://user:pass@host/db?sslmode=require"

NEON_URL=$1
COMPOSE_FILE=${2:-docker-compose.yml}

if [ -z "$NEON_URL" ]; then
  echo "Usage: $0 <NEON_DATABASE_URL> [compose-file]"
  echo ""
  echo "Example:"
  echo "  $0 \"postgresql://user:pass@ep-broad-hat.neon.tech/neondb?sslmode=require\""
  exit 1
fi

echo "=== Neon to Docker PostgreSQL Migration ==="

echo ""
echo "1. Ensuring Docker containers are running..."
docker compose -f "$COMPOSE_FILE" up -d db
sleep 5

echo ""
echo "2. Running Prisma migrations to create schema..."
docker compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy --schema=prisma/schema.prisma

echo ""
echo "3. Exporting data from Neon (data only, no schema)..."
pg_dump "$NEON_URL" --no-owner --no-acl --data-only > /tmp/neon_data.sql

echo ""
echo "4. Importing data into Docker PostgreSQL..."
docker compose -f "$COMPOSE_FILE" exec -T db psql -U goresto_user -d goresto < /tmp/neon_data.sql

echo ""
echo "5. Cleaning up..."
rm -f /tmp/neon_data.sql

echo ""
echo "=== Migration complete! ==="
echo ""
echo "Verify by running:"
echo "  docker compose -f $COMPOSE_FILE exec db psql -U goresto_user -d goresto -c 'SELECT count(*) FROM \"User\";'"
