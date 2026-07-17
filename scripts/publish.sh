#!/usr/bin/env bash
# ============================================================================
#  Enterprise Management System - PUBLISH SCRIPT (Linux/Mac)
#  Publishes backend and frontend, then creates a deployment package.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
SOLUTION_FILE="$BACKEND_DIR/EnterpriseManagement.sln"
API_PROJECT="$BACKEND_DIR/EnterpriseManagement.Api/EnterpriseManagement.Api.csproj"
DEPLOY_DIR="$ROOT_DIR/deployment"
PUBLISH_DIR="$DEPLOY_DIR/publish"
BACKEND_PUB="$PUBLISH_DIR/backend"
FRONTEND_PUB="$PUBLISH_DIR/frontend"
PACKAGE_DIR="$DEPLOY_DIR/packages"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE_FILE="$PACKAGE_DIR/ems-deploy-$TIMESTAMP.zip"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

echo -e "${CYAN}============================================================================"
echo -e " Enterprise Management System - PUBLISH (Production)"
echo -e "============================================================================${RESET}"
echo

# --- Build Release ---
echo -e "${YELLOW}[1/5] Building solution (Release)...${RESET}"
if [ ! -f "$SOLUTION_FILE" ]; then
  echo -e "${RED}[ERROR] Solution not found: $SOLUTION_FILE${RESET}"
  exit 1
fi
dotnet build "$SOLUTION_FILE" --configuration Release
echo -e "${GREEN}    Build succeeded.${RESET}"

# --- Publish backend ---
echo -e "${YELLOW}[2/5] Publishing backend...${RESET}"
rm -rf "$BACKEND_PUB"
dotnet publish "$API_PROJECT" --configuration Release --output "$BACKEND_PUB" --no-build
echo -e "${GREEN}    Backend published to $BACKEND_PUB${RESET}"

# --- Publish frontend ---
echo -e "${YELLOW}[3/5] Publishing frontend...${RESET}"
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${YELLOW}    [WARN] Frontend directory not found: $FRONTEND_DIR (skipping)${RESET}"
else
  rm -rf "$FRONTEND_PUB"
  if [ -f "$FRONTEND_DIR/package.json" ]; then
    ( cd "$FRONTEND_DIR" && npm install && npm run build )
    if [ -d "$FRONTEND_DIR/dist" ]; then
      cp -r "$FRONTEND_DIR/dist/." "$FRONTEND_PUB/"
    elif [ -d "$FRONTEND_DIR/build" ]; then
      cp -r "$FRONTEND_DIR/build/." "$FRONTEND_PUB/"
    fi
    echo -e "${GREEN}    Frontend published to $FRONTEND_PUB${RESET}"
  else
    echo -e "${YELLOW}    [WARN] No package.json in frontend; copying source.${RESET}"
    mkdir -p "$FRONTEND_PUB"
    cp -r "$FRONTEND_DIR/." "$FRONTEND_PUB/"
  fi
fi

# --- Create deployment package ---
echo -e "${YELLOW}[4/5] Creating deployment package...${RESET}"
mkdir -p "$PACKAGE_DIR"
rm -f "$PACKAGE_FILE"
if command -v zip >/dev/null 2>&1; then
  ( cd "$PUBLISH_DIR" && zip -r "$PACKAGE_FILE" . >/dev/null )
else
  tar -czf "${PACKAGE_FILE%.zip}.tar.gz" -C "$PUBLISH_DIR" .
  PACKAGE_FILE="${PACKAGE_FILE%.zip}.tar.gz"
fi
echo -e "${GREEN}    Package created: $PACKAGE_FILE${RESET}"

# --- Summary ---
echo -e "${YELLOW}[5/5] Publish summary${RESET}"
echo -e "${CYAN}----------------------------------------------------------------------------"
echo -e " Backend : $BACKEND_PUB"
echo -e " Frontend: $FRONTEND_PUB"
echo -e " Package : $PACKAGE_FILE"
echo -e "----------------------------------------------------------------------------${RESET}"
PKG_MB=$(du -m "$PACKAGE_FILE" | cut -f1)
echo -e "${GREEN}    Package size: ${PKG_MB} MB${RESET}"
echo -e "${GREEN}============================================================================"
echo -e " PUBLISH SUCCESSFUL"
echo -e "============================================================================${RESET}"
