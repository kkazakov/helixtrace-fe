#!/bin/bash
set -e

docker compose build --no-cache
docker compose down
docker compose up -d

echo "Deployed at http://localhost:8080"
