#!/usr/bin/env bash
# ============================================================================
#  Enterprise Management System - INSTALL SCRIPT (Linux/Mac)
#  Installs all dependencies, creates the database, runs migrations and seeds.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
SOLUTION_FILE="$BACKEND_DIR/EnterpriseManagement.sln"
API_PROJECT="$BACKEND_DIR/EnterpriseManagement.Api/EnterpriseManagement.Api.csproj"
ROOT_DB_DIR="$ROOT_DIR/database/scripts"
SEED_SQL="$ROOT_DB_DIR/seed.sql"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

echo -e "${CYAN}============================================================================"
echo -e " Enterprise Management System - INSTALL"
echo -e "============================================================================${RESET}"
echo

# --- Check prerequisites ---
echo -e "${YELLOW}[1/7] Checking prerequisites...${RESET}"
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Node.js not found. Install from https://nodejs.org${RESET}"
  exit 1
else
  echo -e "${GREEN}    Node.js: $(node --version)${RESET}"
fi
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] npm not found.${RESET}"
  exit 1
else
  echo -e "${GREEN}    npm: $(npm --version)${RESET}"
fi
if ! command -v dotnet >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] .NET 9 SDK not found.${RESET}"
  exit 1
else
  echo -e "${GREEN}    .NET SDK: $(dotnet --version)${RESET}"
fi
if command -v sqlcmd >/dev/null 2>&1; then
  if ! sqlcmd -S localhost -Q "SELECT 1" -b >/dev/null 2>&1; then
    echo -e "${YELLOW}    [WARN] SQL Server not reachable; database steps may fail.${RESET}"
  else
    echo -e "${GREEN}    SQL Server reachable.${RESET}"
  fi
else
  echo -e "${YELLOW}    [WARN] sqlcmd not found; skipping SQL Server check.${RESET}"
fi

# --- Frontend dependencies ---
echo -e "${YELLOW}[2/7] Installing frontend dependencies...${RESET}"
if [ -f "$FRONTEND_DIR/package.json" ]; then
  ( cd "$FRONTEND_DIR" && npm install )
  echo -e "${GREEN}    Frontend dependencies installed.${RESET}"
else
  echo -e "${YELLOW}    [SKIP] No frontend package.json found.${RESET}"
fi

# --- Backend packages ---
echo -e "${YELLOW}[3/7] Installing backend packages (dotnet restore)...${RESET}"
if [ ! -f "$SOLUTION_FILE" ]; then
  echo -e "${RED}[ERROR] Solution not found: $SOLUTION_FILE${RESET}"
  exit 1
fi
dotnet restore "$SOLUTION_FILE"
echo -e "${GREEN}    Backend packages restored.${RESET}"

# --- Create database if not exists ---
echo -e "${YELLOW}[4/7] Creating database if not exists...${RESET}"
"$SCRIPT_DIR/database.sh"

# --- EF Core migrations ---
echo -e "${YELLOW}[5/7] Applying EF Core migrations...${RESET}"
if [ -f "$API_PROJECT" ]; then
  dotnet tool install --global dotnet-ef >/dev/null 2>&1 || true
  dotnet ef database update --project "$API_PROJECT"
  echo -e "${GREEN}    Migrations applied.${RESET}"
else
  echo -e "${YELLOW}    [SKIP] API project not found.${RESET}"
fi

# --- Seed initial data ---
echo -e "${YELLOW}[6/7] Seeding initial data...${RESET}"
if [ -f "$SEED_SQL" ]; then
  if command -v sqlcmd >/dev/null 2>&1; then
    if ! sqlcmd -S localhost -d EnterpriseManagement -i "$SEED_SQL" -b >/dev/null 2>&1; then
      echo -e "${YELLOW}    [WARN] Seed script failed (may already be seeded).${RESET}"
    else
      echo -e "${GREEN}    Initial data seeded.${RESET}"
    fi
  else
    echo -e "${YELLOW}    [SKIP] sqlcmd not available; cannot run seed.sql.${RESET}"
  fi
else
  echo -e "${YELLOW}    [SKIP] No seed.sql found.${RESET}"
fi

# --- Verify ---
echo -e "${YELLOW}[7/7] Verifying installation...${RESET}"
dotnet build "$SOLUTION_FILE" --configuration Release
echo -e "${GREEN}    Verification build succeeded.${RESET}"

echo -e "${GREEN}============================================================================"
echo -e " INSTALL COMPLETE"
echo -e "============================================================================${RESET}"
echo -e "${CYAN}Next steps:${RESET}"
echo -e "   1. Run $SCRIPT_DIR/run.sh to start the API in development mode."
echo -e "   2. Open https://localhost:5001/swagger in your browser."
echo -e "   3. Run $SCRIPT_DIR/publish.sh to create a production package."
