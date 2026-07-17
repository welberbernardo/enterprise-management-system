# deploy.ps1 - Deploy the Enterprise Management System (Windows / PowerShell)
# Requires Docker Desktop running with the Compose plugin.

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

function Log($msg)  { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ----------------------------------------------------------
# 1. Pre-flight checks
# ----------------------------------------------------------
Log "Checking prerequisites..."

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Err "Docker is not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

try {
    $null = docker info 2>&1
} catch {
    Err "Docker daemon is not running. Start Docker Desktop and try again."
    exit 1
}

$composeOk = $false
try {
    docker compose version | Out-Null
    $composeOk = $true
} catch {
    $composeOk = $false
}
if (-not $composeOk) {
    Err "Docker Compose plugin is not available. Update Docker Desktop."
    exit 1
}

# ----------------------------------------------------------
# 2. Environment file
# ----------------------------------------------------------
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Warn "No .env found. Copying .env.example -> .env. EDIT IT BEFORE PRODUCTION USE."
        Copy-Item .env.example .env
    } else {
        Err "Neither .env nor .env.example found."
        exit 1
    }
}

# ----------------------------------------------------------
# 3. Generate self-signed SSL certs if missing
# ----------------------------------------------------------
$SslDir = "./ssl"
if (-not (Test-Path "$SslDir/fullchain.pem") -or -not (Test-Path "$SslDir/privkey.pem")) {
    Warn "SSL certificates not found. Generating self-signed certificates for local/dev use..."
    New-Item -ItemType Directory -Force -Path $SslDir | Out-Null
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout "$SslDir/privkey.pem" `
        -out "$SslDir/fullchain.pem" `
        -subj "/C=US/ST=State/L=City/O=Enterprise/OU=IT/CN=localhost" 2>&1 | Out-Null
    Log "Self-signed certificates created in $SslDir"
}

# ----------------------------------------------------------
# 4. Pull latest base images
# ----------------------------------------------------------
Log "Pulling latest base images..."
docker compose pull

# ----------------------------------------------------------
# 5. Build services
# ----------------------------------------------------------
Log "Building services..."
docker compose build --pull

# ----------------------------------------------------------
# 6. Start SQL Server first
# ----------------------------------------------------------
Log "Starting SQL Server..."
docker compose up -d sqlserver

Log "Waiting for SQL Server to become healthy..."
for ($i = 1; $i -le 30; $i++) {
    $id = (docker compose ps -q sqlserver)
    if ($id) {
        $health = (docker inspect -f '{{.State.Health.Status}}' $id 2>$null)
        if ($health -eq "healthy") {
            Log "SQL Server is healthy."
            break
        }
    }
    Start-Sleep -Seconds 5
}

# ----------------------------------------------------------
# 7. Run database migrations
# ----------------------------------------------------------
Log "Running database migrations..."
try {
    docker compose run --rm backend dotnet backend.dll --migrate
    Log "Migrations completed."
} catch {
    Warn "Migration command failed or not supported. Ensure the backend supports '--migrate'."
}

# ----------------------------------------------------------
# 8. Start all remaining services
# ----------------------------------------------------------
Log "Starting all services..."
docker compose up -d

# ----------------------------------------------------------
# 9. Health checks
# ----------------------------------------------------------
Log "Performing health checks..."
Start-Sleep -Seconds 10
docker compose ps

# ----------------------------------------------------------
# 10. Show service URLs
# ----------------------------------------------------------
Log "Deployment complete."
Log "  Frontend : https://localhost/"
Log "  Backend  : https://localhost/api/"
Log "  SQL      : localhost:1433"

# ----------------------------------------------------------
# 11. Stream logs
# ----------------------------------------------------------
$answer = Read-Host "Stream logs now? [y/N]"
if ($answer -match '^[Yy]$') {
    docker compose logs -f
}
