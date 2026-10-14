#!/bin/bash
# Automated PostgreSQL backup for Eco-Return Ireland
# Add to crontab: 0 2 * * * /opt/app/eco-return/backup.sh

BACKUP_DIR="/opt/app/eco-return/backups"
COMPOSE_FILE="/opt/app/eco-return/docker-compose.prod.yml"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql.gz"

docker compose -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U "$DB_USERNAME" eco_return | gzip > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
  echo "$(date): Backup created: $FILENAME"
else
  echo "$(date): Backup FAILED" >&2
  exit 1
fi

# Delete backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$KEEP_DAYS -delete
