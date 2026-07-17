#!/usr/bin/env pwsh
# ============================================================================
#  Enterprise Management System - SETUP.PS1 (Cross-platform PowerShell)
#  Detects OS, checks prerequisites, and provides an interactive menu to:
#    1. Full Setup   2. Build Only        3. Run Development
#    4. Publish Prod 5. Setup Database    6. Run Tests
#    7. Clean        8. Exit
# ============================================================================
[CmdletBinding()]
param(
    [string]$Action = "",
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# ---------- Colors ----------
if ($Host.UI.SupportsVirtualTerminal) {
    $RED    = "`e[31m"; $GREEN = "`e[32m"; $YELLOW = "`e[33m"
    $CYAN   = "`e[36m"; $RESET = "`e[0m"; $BOLD = "`e[1m"
} else {
    $RED=$GREEN=$YELLOW=$CYAN=$RESET=$BOLD=""
}

$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ROOT_DIR    = Split-Path -Parent $SCRIPT_DIR
$BACKEND_DIR = Join-Path $ROOT_DIR "src/backend"
$FRONTEND_DIR= Join-Path $ROOT_DIR "src/frontend"
$SOLUTION    = Join-Path $BACKEND_DIR "EnterpriseManagement.sln"
$API_PROJECT = Join-Path $BACKEND_DIR "EnterpriseManagement.Api/EnterpriseManagement.Api.csproj"
$DEPLOY_DIR  = Join-Path $ROOT_DIR "deployment"
$PUBLISH_DIR = Join-Path $DEPLOY_DIR "publish"
$BACKEND_PUB = Join-Path $PUBLISH_DIR "backend"
$FRONTEND_PUB= Join-Path $PUBLISH_DIR "frontend"

# ---------- Logging ----------
$LOG_DIR = Join-Path $ROOT_DIR "logs"
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
$LOG_FILE = Join-Path $LOG_DIR ("setup-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".log")

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts $Message" | Out-File -Append -FilePath $LOG_FILE -Encoding utf8
}

function Write-Info  { param([string]$m) Write-Host "${CYAN}$m${RESET}"; Write-Log "[INFO] $m" }
function Write-Ok    { param([string]$m) Write-Host "${GREEN}$m${RESET}"; Write-Log "[OK]   $m" }
function Write-Warn  { param([string]$m) Write-Host "${YELLOW}$m${RESET}"; Write-Log "[WARN] $m" }
function Write-Err   { param([string]$m) Write-Host "${RED}$m${RESET}"; Write-Log "[ERROR]$m" }

# ---------- OS Detection ----------
function Get-OS {
    $p = [System.Environment]::OSVersion.Platform
    if ($IsWindows -or $p -eq [System.PlatformID]::Win32NT) { return "Windows" }
    if ($IsMacOS) { return "Mac" }
    return "Linux"
}
$OS = Get-OS

function Invoke-Script {
    param([string]$Name)
    $path = Join-Path $SCRIPT_DIR $Name
    if ($OS -eq "Windows") {
        & cmd /c "call `"$path`"" ; return $LASTEXITCODE
    } else {
        bash "$path" ; return $LASTEXITCODE
    }
}

# ---------- Prerequisite checks ----------
function Test-Prerequisites {
    Write-Info "Checking prerequisites on $OS ..."
    $allOk = $true

    # .NET
    try {
        $ver = (dotnet --version 2>$null)
        if ($ver -match '^9\.') { Write-Ok "  .NET SDK 9: $ver" }
        else { Write-Warn "  .NET SDK: $ver (9.x recommended)"; $allOk = $false }
    } catch { Write-Err "  .NET SDK not found"; $allOk = $false }

    # Node / npm
    try {
        $nv = (node --version 2>$null); Write-Ok "  Node.js: $nv"
    } catch { Write-Warn "  Node.js not found (frontend steps will be skipped)"; $allOk = $false }
    try {
        $nv = (npm --version 2>$null); Write-Ok "  npm: $nv"
    } catch { Write-Warn "  npm not found"; $allOk = $false }

    # SQL Server (optional via sqlcmd)
    $sqlOk = $false
    try {
        if (Get-Command sqlcmd -ErrorAction SilentlyContinue) {
            sqlcmd -S localhost -Q "SELECT 1" -b >$null 2>&1
            if ($LASTEXITCODE -eq 0) { Write-Ok "  SQL Server: reachable"; $sqlOk = $true }
            else { Write-Warn "  SQL Server not reachable on localhost" }
        } else { Write-Warn "  sqlcmd not found; SQL checks skipped" }
    } catch { Write-Warn "  SQL Server check skipped" }

    if ($allOk) { Write-Ok "Prerequisite check passed." }
    else { Write-Warn "Some prerequisites are missing; continue at your own risk." }
}

# ---------- Menu actions ----------
function Do-FullSetup {
    Write-Info "=== Full Setup: install + database + build ==="
    Invoke-Script "install.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
    Invoke-Script "build.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
}
function Do-Build {
    Write-Info "=== Build Only ==="
    Invoke-Script "build.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
}
function Do-Run {
    Write-Info "=== Run Development ==="
    Invoke-Script "run.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
}
function Do-Publish {
    Write-Info "=== Publish Production ==="
    Invoke-Script "publish.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
}
function Do-Database {
    Write-Info "=== Setup Database ==="
    Invoke-Script "database.$(if($OS-eq'Windows'){'bat'}else{'sh'})"
}
function Do-Tests {
    Write-Info "=== Run Tests ==="
    if (Test-Path $SOLUTION) {
        dotnet test $SOLUTION --configuration Release
        if ($LASTEXITCODE -eq 0) { Write-Ok "Tests passed." } else { Write-Err "Tests failed." }
    } else { Write-Err "Solution not found: $SOLUTION" }
}
function Do-Clean {
    Write-Info "=== Clean Everything ==="
    $items = @("artifacts","bin","obj",(Join-Path $DEPLOY_DIR "publish"),(Join-Path $DEPLOY_DIR "packages"))
    foreach ($i in $items) {
        $p = Join-Path $ROOT_DIR $i
        if (Test-Path $p) { Remove-Item -Recurse -Force $p; Write-Ok "  Removed $i" }
    }
    if (Test-Path $FRONTEND_DIR) {
        $nd = Join-Path $FRONTEND_DIR "node_modules"
        if (Test-Path $nd) { Remove-Item -Recurse -Force $nd; Write-Ok "  Removed frontend node_modules" }
    }
    Write-Ok "Clean complete."
}

# ---------- Help ----------
if ($Help) {
    Write-Host "${BOLD}Usage:${RESET}"
    Write-Host "  pwsh setup.ps1 [-Action <name>] [-Help]"
    Write-Host "  Actions: full, build, run, publish, database, test, clean"
    Write-Host "  With no -Action, an interactive menu is shown."
    exit 0
}

# ---------- Header ----------
Write-Host "${BOLD}${CYAN}============================================================================${RESET}"
Write-Host "${BOLD} Enterprise Management System - SETUP ($OS)${RESET}"
Write-Host "${BOLD}${CYAN}============================================================================${RESET}"
Write-Info "Log file: $LOG_FILE"

# ---------- Non-interactive action ----------
$actionMap = @{
    "full"=$true; "build"=$true; "run"=$true; "publish"=$true
    "database"=$true; "test"=$true; "clean"=$true
}
if ($Action -ne "" -and $actionMap.ContainsKey($Action.ToLower())) {
    switch ($Action.ToLower()) {
        "full"    { Do-FullSetup }
        "build"   { Do-Build }
        "run"     { Do-Run }
        "publish" { Do-Publish }
        "database"{ Do-Database }
        "test"    { Do-Tests }
        "clean"   { Do-Clean }
    }
    exit 0
}

# ---------- Interactive menu ----------
while ($true) {
    Write-Host "${BOLD}${CYAN}----------------------------------------------------------------------------${RESET}"
    Write-Host "${BOLD} Please choose an option:${RESET}"
    Write-Host "  ${GREEN}1)${RESET} Full Setup (install + database + build)"
    Write-Host "  ${GREEN}2)${RESET} Build Only"
    Write-Host "  ${GREEN}3)${RESET} Run Development"
    Write-Host "  ${GREEN}4)${RESET} Publish Production"
    Write-Host "  ${GREEN}5)${RESET} Setup Database"
    Write-Host "  ${GREEN}6)${RESET} Run Tests"
    Write-Host "  ${GREEN}7)${RESET} Clean Everything"
    Write-Host "  ${GREEN}8)${RESET} Exit"
    Write-Host "${BOLD}${CYAN}----------------------------------------------------------------------------${RESET}"
    $choice = Read-Host "Enter choice [1-8]"

    switch ($choice) {
        "1" { Do-FullSetup }
        "2" { Do-Build }
        "3" { Do-Run }
        "4" { Do-Publish }
        "5" { Do-Database }
        "6" { Do-Tests }
        "7" { Do-Clean }
        "8" { Write-Ok "Goodbye!"; exit 0 }
        default { Write-Warn "Invalid choice. Please enter 1-8." }
    }
    Write-Host ""
}
