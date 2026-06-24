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
  --network "$COMPOSE_NETWORK" \
  "$MIGRATE_IMAGE"

echo "→ Building and starting application..."
docker compose up -d --build

echo "✓ Deploy complete"
