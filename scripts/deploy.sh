#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_NETWORK="${COMPOSE_NETWORK:-web-network}"
MIGRATE_IMAGE="${MIGRATE_IMAGE:-payload-migrate}"

echo "→ Building migrate image..."
docker build --target migrate -t "$MIGRATE_IMAGE" -f Dockerfile .

echo "→ Running database migrations..."
docker run --rm \
  --env-file .env \
  -e NODE_ENV=production \
  --network "$COMPOSE_NETWORK" \
  "$MIGRATE_IMAGE"

echo "→ Migration status:"
docker run --rm \
  --env-file .env \
  -e NODE_ENV=production \
  --network "$COMPOSE_NETWORK" \
  --entrypoint sh \
  "$MIGRATE_IMAGE" \
  -c "corepack enable pnpm 2>/dev/null || true; pnpm run migrate:status"

echo "→ Building and starting application..."
docker compose up -d --build

echo "✓ Deploy complete"
