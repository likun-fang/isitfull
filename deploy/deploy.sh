#!/usr/bin/env bash
set -euo pipefail

tag=${SSH_ORIGINAL_COMMAND:-}
if [[ -z "$tag" ]]; then
  tag=latest
elif [[ ! "$tag" =~ ^[0-9a-f]{40}$ ]]; then
  printf '%s\n' 'Refusing to deploy: unexpected tag' >&2
  exit 1
fi

export DOCKER_IMAGE="ghcr.io/likun-fang/isitfull-backend:$tag"
printf 'Starting backend deployment: %s\n' "$DOCKER_IMAGE"
cd /opt/app/eco-return
docker compose -f docker-compose.prod.yml pull backend
docker compose -f docker-compose.prod.yml up -d backend
docker image prune -f
printf '%s\n' 'Backend deployment complete'
