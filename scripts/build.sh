#!/usr/bin/env bash
# ============================================================================
#  Enterprise Management System - BUILD SCRIPT (Linux/Mac)
#  Builds the backend solution in Release configuration.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/src/backend"
SOLUTION_FILE="$BACKEND_DIR/EnterpriseManagement.sln"
OUTPUT_DIR="$ROOT_DIR/artifacts/build"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

echo -e "${CYAN}============================================================================"
echo -e " Enterprise Management System - BUILD"
echo -e "============================================================================${RESET}"
echo

# --- Record start time ---
START=$(date +%s.%N)

# --- Check .NET 9 SDK ---
echo -e "${YELLOW}[1/4] Checking .NET 9 SDK...${RESET}"
if ! command -v dotnet >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] dotnet not found. Install .NET 9 SDK.${RESET}"
  exit 1
fi
DOTNET_VER="$(dotnet --version)"
DOTNET_MAJOR="$(echo "$DOTNET_VER" | cut -d. -f1)"
echo -e "    Detected dotnet version: $DOTNET_VER"
if [ "$DOTNET_MAJOR" != "9" ]; then
  echo -e "${RED}[ERROR] .NET 9 SDK required (found $DOTNET_VER).${RESET}"
  exit 1
fi
echo -e "${GREEN}    .NET 9 SDK is available.${RESET}"

# --- Restore packages ---
echo -e "${YELLOW}[2/4] Restoring NuGet packages...${RESET}"
if [ ! -f "$SOLUTION_FILE" ]; then
  echo -e "${RED}[ERROR] Solution not found: $SOLUTION_FILE${RESET}"
  exit 1
fi
dotnet restore "$SOLUTION_FILE"
echo -e "${GREEN}    Restore completed.${RESET}"

# --- Build ---
echo -e "${YELLOW}[3/4] Building solution (Release)...${RESET}"
dotnet build "$SOLUTION_FILE" --configuration Release --no-restore --output "$OUTPUT_DIR"
echo -e "${GREEN}    Build succeeded.${RESET}"

# --- Report ---
echo -e "${YELLOW}[4/4] Finalizing...${RESET}"
END=$(date +%s.%N)
DURATION=$(echo "$END - $START" | bc)
echo -e "    Build duration: ${DURATION} seconds"
echo -e "${GREEN}    Output directory: $OUTPUT_DIR${RESET}"

echo -e "${GREEN}============================================================================"
echo -e " BUILD SUCCESSFUL"
echo -e "============================================================================${RESET}"

# --- Open output directory on success (desktop environments only) ---
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$OUTPUT_DIR" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$OUTPUT_DIR" >/dev/null 2>&1 || true
fi
