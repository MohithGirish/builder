#!/usr/bin/env bash
#
# backup-db.sh — Nightly pg_dump of the production database to S3.
#
# Postgres runs as a container on this single box with no managed backups, so
# this is the only thing standing between an EBS failure and total data loss.
# Dumps are gzipped, integrity-checked, then uploaded under pg/YYYY/MM/DD/.
# A bucket lifecycle rule expires them after 30 days.
#
# The instance role can PutObject but NOT GetObject or DeleteObject, so a
# compromised box cannot read back or destroy the backup history.
#
# Installed as a systemd timer (builderai-backup.timer), not cron -- AL2023
# ships systemd but not cronie.
#
# Restore:  gunzip -c dump.sql.gz | docker compose -f docker-compose.prod.yml \
#             exec -T postgres psql -U <user> -d <db>
set -euo pipefail

BUCKET=builderai-backups-107f3810
REGION=ap-south-1
APP_DIR=/opt/builderai

cd "$APP_DIR"

# Read the two values we need directly rather than sourcing .env: secrets in it
# legitimately contain spaces (a Gmail app password does), and `. ./.env` would
# choke on them.
DB_USER=$(grep '^DB_USER=' .env | cut -d= -f2-)
DB_NAME=$(grep '^DB_NAME=' .env | cut -d= -f2-)
[ -n "$DB_USER" ] && [ -n "$DB_NAME" ] || { echo "ERROR: DB_USER/DB_NAME missing from .env"; exit 1; }

STAMP=$(date -u +%Y/%m/%d/%H%M%SZ)
TMP=$(mktemp /tmp/pgdump-XXXXXX.sql.gz)
trap 'rm -f "$TMP"' EXIT

echo "==> dumping $DB_NAME"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean --if-exists \
  | gzip -9 > "$TMP"

# Verify before uploading. Streaming pg_dump straight into `aws s3 cp -` would
# happily publish a truncated dump if postgres died mid-run; a backup you cannot
# restore is worse than none, because it looks like you are covered.
gzip -t "$TMP"
SIZE=$(stat -c%s "$TMP")
[ "$SIZE" -ge 1000 ] || { echo "ERROR: dump is only ${SIZE}B -- refusing to upload"; exit 1; }

echo "==> uploading ${SIZE}B to s3://$BUCKET/pg/$STAMP.sql.gz"
aws s3 cp "$TMP" "s3://$BUCKET/pg/$STAMP.sql.gz" --region "$REGION" --only-show-errors

echo "==> backup complete"
