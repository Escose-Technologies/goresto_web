#!/bin/bash
set -e

COMPOSE_FILE=${1:-docker-compose.staging.yml}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Load env vars for DB_USER
if [ -f .env ]; then
  source .env
fi

DB_USER=${DB_USER:-goresto_user}
DB_NAME=${DB_NAME:-goresto_staging}

mkdir -p "$BACKUP_DIR"

echo "Backing up database..."
docker compose -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/goresto_${TIMESTAMP}.sql.gz"

echo "Backup created: $BACKUP_DIR/goresto_${TIMESTAMP}.sql.gz"

# Keep only last 7 days of backups
echo "Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "goresto_*.sql.gz" -mtime +7 -delete

echo "Done!"
