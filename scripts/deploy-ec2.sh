#!/usr/bin/env bash
#
# deploy-ec2.sh — Runs ON the EC2 host to (re)deploy the backend stack.
#
# Rebuilds .env from SSM Parameter Store (the source of truth for secrets --
# nothing sensitive is ever committed), pulls the latest main, rebuilds the
# containers, then runs migrations as an explicit release step.
#
# Invoked remotely via SSM Send-Command; there is no SSH access to this box.
#
#   sudo /opt/builderai/scripts/deploy-ec2.sh
set -euo pipefail

APP_DIR=/opt/builderai
REGION=ap-south-1
SSM_PATH=/builderai/prod

command -v jq >/dev/null || { echo "ERROR: jq not installed"; exit 1; }

cd "$APP_DIR"

echo "==> refreshing .env from SSM $SSM_PATH"
# jq (not awk) because secrets legitimately contain spaces and '=' -- an
# awk '{print $1"="$2}' silently truncates a Gmail app password at its space.
aws ssm get-parameters-by-path \
  --path "$SSM_PATH" --recursive --with-decryption --region "$REGION" \
  | jq -r --arg p "$SSM_PATH/" '.Parameters[] | "\(.Name | ltrimstr($p))=\(.Value)"' > .env.new
if [ ! -s .env.new ]; then echo "ERROR: SSM returned no parameters"; rm -f .env.new; exit 1; fi
mv .env.new .env
chmod 600 .env
echo "    $(wc -l < .env) parameters written"

echo "==> pulling latest main"
git fetch origin main --quiet
git reset --hard origin/main --quiet
git log --oneline -1

echo "==> building and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> waiting for postgres to be healthy"
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -q; then break; fi
  sleep 2
done

# Release step, per the deploy contract in CLAUDE.md: migrations run once here,
# never at container boot where replicas would race. db:seed is NEVER run in
# production -- it inserts demo data and throws without ADMIN_* set.
echo "==> running migrations"
docker compose -f docker-compose.prod.yml exec -T backend npm run db:migrate

echo "==> status"
docker compose -f docker-compose.prod.yml ps
