@echo off
REM ============================================================================
REM  Enterprise Management System - RUN SCRIPT (Windows)
REM  Starts the backend API and opens Swagger UI in the browser.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\src\backend"
set "API_PROJECT=%BACKEND_DIR%\EnterpriseManagement.Api\EnterpriseManagement.Api.csproj"
set "SWAGGER_URL=https://localhost:5001/swagger"

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo %CYAN%============================================================================
echo  Enterprise Management System - RUN (Development)
echo ============================================================================%RESET%
echo.

REM --- Prerequisite: .NET 9 SDK ---
echo %YELLOW%[1/3] Checking prerequisites...%RESET%
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] .NET 9 SDK not found. Run install.bat first.%RESET%
    exit /b 1
)
echo %GREEN%    .NET SDK available.%RESET%

REM --- Prerequisite: SQL Server (simple reachability check via sqlcmd if present) ---
where sqlcmd >nul 2>&1
if not errorlevel 1 (
    sqlcmd -S localhost -Q "SELECT 1" -b >nul 2>&1
    if errorlevel 1 (
        echo %YELLOW%    [WARN] SQL Server does not appear to be reachable on localhost.%RESET%
        echo %YELLOW%           Ensure SQL Server is running before using the API.%RESET%
    ) else (
        echo %GREEN%    SQL Server reachable.%RESET%
    )
) else (
    echo %YELLOW%    [INFO] sqlcmd not installed; skipping SQL Server connectivity check.%RESET%
)

REM --- Start API ---
echo %YELLOW%[2/3] Starting backend API...%RESET%
if not exist "%API_PROJECT%" (
    echo %RED%[ERROR] API project not found: %API_PROJECT%%RESET%
    exit /b 1
)
echo %GREEN%    Launching API (Ctrl+C to stop gracefully)...%RESET%
echo %CYAN%    Swagger UI will open at: %SWAGGER_URL%%RESET%
echo.

REM Open browser after a short delay so the server can bind
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 6; Start-Process '%SWAGGER_URL%'"

REM --- Show logs (this blocks until Ctrl+C) ---
echo %YELLOW%[3/3] Attaching to application logs (press Ctrl+C to shut down)...%RESET%
dotnet run --project "%API_PROJECT%" --configuration Debug
set "RC=%errorlevel%"

echo.
if "%RC%"=="0" (
    echo %GREEN%    API stopped cleanly.%RESET%
) else (
    echo %RED%    API exited with code %RC%.%RESET%
)
exit /b %RC%
