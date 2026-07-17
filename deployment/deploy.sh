#!/usr/bin/env bash
#
# deploy.sh - Deploy the Enterprise Management System (Linux / macOS)
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ----------------------------------------------------------
# 1. Pre-flight checks
# ----------------------------------------------------------
log "Checking prerequisites..."

if ! command -v docker >/dev/null 2>&1; then
    err "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    err "Docker Compose (plugin) is not available. Install the Docker Compose plugin."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    err "Docker daemon is not running. Start Docker and try again."
    exit 1
fi

# ----------------------------------------------------------
# 2. Environment file
# ----------------------------------------------------------
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        warn "No .env found. Copying .env.example -> .env. EDIT IT BEFORE PRODUCTION USE."
        cp .env.example .env
    else
        err "Neither .env nor .env.example found."
        exit 1
    fi
fi

# ----------------------------------------------------------
# 3. Generate self-signed SSL certs if missing
# ----------------------------------------------------------
SSL_DIR="./ssl"
if [ ! -f "$SSL_DIR/fullchain.pem" ] || [ ! -f "$SSL_DIR/privkey.pem" ]; then
    warn "SSL certificates not found. Generating self-signed certificates for local/dev use..."
    mkdir -p "$SSL_DIR"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/privkey.pem" \
        -out "$SSL_DIR/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Enterprise/OU=IT/CN=localhost"
    log "Self-signed certificates created in $SSL_DIR"
fi

# ----------------------------------------------------------
# 4. Pull latest base images
# ----------------------------------------------------------
log "Pulling latest base images..."
docker compose pull

# ----------------------------------------------------------
# 5. Build services
# ----------------------------------------------------------
log "Building services..."
docker compose build --pull

# ----------------------------------------------------------
# 6. Start SQL Server first (needs to be healthy)
# ----------------------------------------------------------
log "Starting SQL Server..."
docker compose up -d sqlserver

log "Waiting for SQL Server to become healthy..."
for i in $(seq 1 30); do
    HEALTH=$(docker compose ps -q sqlserver | xargs -r docker inspect -f '{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    if [ "$HEALTH" = "healthy" ]; then
        log "SQL Server is healthy."
        break
    fi
    sleep 5
done

# ----------------------------------------------------------
# 7. Run database migrations
# ----------------------------------------------------------
log "Running database migrations..."
if docker compose run --rm backend dotnet backend.dll --migrate; then
    log "Migrations completed."
else
    warn "Migration command failed or not supported. Ensure the backend supports '--migrate'."
fi

# ----------------------------------------------------------
# 8. Start all remaining services
# ----------------------------------------------------------
log "Starting all services..."
docker compose up -d

# ----------------------------------------------------------
# 9. Health checks
# ----------------------------------------------------------
log "Performing health checks..."
sleep 10
docker compose ps

# ----------------------------------------------------------
# 10. Show service URLs
# ----------------------------------------------------------
log "Deployment complete."
log "  Frontend : https://localhost/"
log "  Backend  : https://localhost/api/"
log "  SQL      : localhost:1433"

# ----------------------------------------------------------
# 11. Stream logs (Ctrl+C to stop)
# ----------------------------------------------------------
read -r -p "Stream logs now? [y/N] " answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
    docker compose logs -f
fi
