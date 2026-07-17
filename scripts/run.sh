#!/usr/bin/env bash
# ============================================================================
#  Enterprise Management System - RUN SCRIPT (Linux/Mac)
#  Starts the backend API and opens Swagger UI in the browser.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
API_PROJECT="$BACKEND_DIR/EnterpriseManagement.Api/EnterpriseManagement.Api.csproj"
SWAGGER_URL="https://localhost:5001/swagger"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

echo -e "${CYAN}============================================================================"
echo -e " Enterprise Management System - RUN (Development)"
echo -e "============================================================================${RESET}"
echo

# --- Prerequisite: .NET 9 SDK ---
echo -e "${YELLOW}[1/3] Checking prerequisites...${RESET}"
if ! command -v dotnet >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] dotnet not found. Run install.sh first.${RESET}"
  exit 1
fi
echo -e "${GREEN}    .NET SDK available.${RESET}"

# --- Prerequisite: SQL Server reachability (optional) ---
if command -v sqlcmd >/dev/null 2>&1; then
  if ! sqlcmd -S localhost -Q "SELECT 1" -b >/dev/null 2>&1; then
    echo -e "${YELLOW}    [WARN] SQL Server not reachable on localhost.${RESET}"
  else
    echo -e "${GREEN}    SQL Server reachable.${RESET}"
  fi
else
  echo -e "${YELLOW}    [INFO] sqlcmd not installed; skipping SQL Server check.${RESET}"
fi

# --- Start API ---
echo -e "${YELLOW}[2/3] Starting backend API...${RESET}"
if [ ! -f "$API_PROJECT" ]; then
  echo -e "${RED}[ERROR] API project not found: $API_PROJECT${RESET}"
  exit 1
fi
echo -e "${GREEN}    Launching API (Ctrl+C to stop gracefully)...${RESET}"
echo -e "${CYAN}    Swagger UI will open at: $SWAGGER_URL${RESET}"
echo

# Open browser after delay
(sleep 6 && { command -v xdg-open >/dev/null 2>&1 && xdg-open "$SWAGGER_URL"; } || { command -v open >/dev/null 2>&1 && open "$SWAGGER_URL"; } >/dev/null 2>&1 || true) &

# --- Show logs (blocks until Ctrl+C) ---
echo -e "${YELLOW}[3/3] Attaching to application logs (press Ctrl+C to shut down)...${RESET}"
trap 'echo; echo -e "${GREEN}    API stopped cleanly.${RESET}"; exit 0' INT TERM
dotnet run --project "$API_PROJECT" --configuration Debug
