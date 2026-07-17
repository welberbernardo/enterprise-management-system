#!/usr/bin/env bash
# ============================================================================
#  Enterprise Management System - DATABASE SCRIPT (Linux/Mac)
#  Checks SQL Server, creates DB, runs SQL scripts, verifies state.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DB_DIR="$ROOT_DIR/database"
SCRIPTS_DIR="$DB_DIR/scripts"
SERVER="localhost"
DBNAME="EnterpriseManagement"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

echo -e "${CYAN}============================================================================"
echo -e " Enterprise Management System - DATABASE SETUP"
echo -e " Server: $SERVER   Database: $DBNAME"
echo -e "============================================================================${RESET}"
echo

# --- Check SQL Server connectivity ---
echo -e "${YELLOW}[1/5] Checking SQL Server connectivity...${RESET}"
if ! command -v sqlcmd >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] sqlcmd not found. Install SQL Server command line tools.${RESET}"
  exit 1
fi
if ! sqlcmd -S "$SERVER" -Q "SELECT 1" -b >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Cannot connect to SQL Server at $SERVER.${RESET}"
  exit 1
fi
echo -e "${GREEN}    Connected to SQL Server.${RESET}"

# --- Create database if not exists ---
echo -e "${YELLOW}[2/5] Creating database if not exists...${RESET}"
sqlcmd -S "$SERVER" -Q "IF DB_ID('$DBNAME') IS NULL CREATE DATABASE [$DBNAME];" -b
echo -e "${GREEN}    Database '$DBNAME' ready.${RESET}"

# --- Run SQL scripts ---
echo -e "${YELLOW}[3/5] Running SQL scripts...${RESET}"
for s in schema indexes stored-procedures views functions seed; do
  F="$SCRIPTS_DIR/$s.sql"
  if [ -f "$F" ]; then
    echo -e "${CYAN}    - $s.sql${RESET}"
    if ! sqlcmd -S "$SERVER" -d "$DBNAME" -i "$F" -b >/dev/null 2>&1; then
      echo -e "${RED}[ERROR] Failed executing $s.sql${RESET}"
      exit 1
    fi
  else
    echo -e "${YELLOW}    [SKIP] $s.sql not found.${RESET}"
  fi
done
echo -e "${GREEN}    All available SQL scripts executed.${RESET}"

# --- Verify database state ---
echo -e "${YELLOW}[4/5] Verifying database state...${RESET}"
TBL=$(sqlcmd -S "$SERVER" -d "$DBNAME" -h -1 -Q "SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped=0;" 2>/dev/null | tr -d '[:space:]')
TBL="${TBL:-0}"
echo -e "${GREEN}    User tables: $TBL${RESET}"

# --- Show database info ---
echo -e "${YELLOW}[5/5] Database info${RESET}"
echo -e "${CYAN}----------------------------------------------------------------------------"
sqlcmd -S "$SERVER" -d "$DBNAME" -h -1 -Q "SELECT name FROM sys.tables WHERE is_ms_shipped=0 ORDER BY name;" -W 2>/dev/null
echo -e "----------------------------------------------------------------------------${RESET}"

echo -e "${GREEN}============================================================================"
echo -e " DATABASE SETUP COMPLETE"
echo -e "============================================================================${RESET}"
