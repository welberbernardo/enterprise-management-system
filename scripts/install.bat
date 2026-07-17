@echo off
REM ============================================================================
REM  Enterprise Management System - INSTALL SCRIPT (Windows)
REM  Installs all dependencies, creates the database, runs migrations and seeds.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\src\backend"
set "FRONTEND_DIR=%ROOT_DIR%\src\frontend"
set "SOLUTION_FILE=%BACKEND_DIR%\EnterpriseManagement.sln"
set "API_PROJECT=%BACKEND_DIR%\EnterpriseManagement.Api\EnterpriseManagement.Api.csproj"

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo %CYAN%============================================================================
echo  Enterprise Management System - INSTALL
echo ============================================================================%RESET%
echo.

REM --- Check prerequisites ---
echo %YELLOW%[1/7] Checking prerequisites...%RESET%

where node >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] Node.js not found. Install from https://nodejs.org%RESET%
    exit /b 1
) else (
    for /f "tokens=1" %%v in ('node --version') do echo %GREEN%    Node.js: %%v%RESET%
)

where npm >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] npm not found.%RESET%
    exit /b 1
) else (
    for /f "tokens=1" %%v in ('npm --version') do echo %GREEN%    npm: %%v%RESET%
)

dotnet --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] .NET 9 SDK not found. Install from https://dotnet.microsoft.com%RESET%
    exit /b 1
) else (
    for /f "tokens=1" %%v in ('dotnet --version') do echo %GREEN%    .NET SDK: %%v%RESET%
)

where sqlcmd >nul 2>&1
if not errorlevel 1 (
    sqlcmd -S localhost -Q "SELECT 1" -b >nul 2>&1
    if errorlevel 1 (
        echo %YELLOW%    [WARN] SQL Server not reachable; database steps may fail.%RESET%
    ) else (
        echo %GREEN%    SQL Server: reachable%RESET%
    )
) else (
    echo %YELLOW%    [WARN] sqlcmd not found; skipping SQL Server check.%RESET%
)

REM --- Frontend dependencies ---
echo %YELLOW%[2/7] Installing frontend dependencies...%RESET%
if exist "%FRONTEND_DIR%\package.json" (
    pushd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo %RED%[ERROR] npm install failed.%RESET%
        popd
        exit /b 1
    )
    popd
    echo %GREEN%    Frontend dependencies installed.%RESET%
) else (
    echo %YELLOW%    [SKIP] No frontend package.json found.%RESET%
)

REM --- Backend packages ---
echo %YELLOW%[3/7] Installing backend packages (dotnet restore)...%RESET%
if not exist "%SOLUTION_FILE%" (
    echo %RED%[ERROR] Solution not found: %SOLUTION_FILE%%RESET%
    exit /b 1
)
dotnet restore "%SOLUTION_FILE%"
if errorlevel 1 (
    echo %RED%[ERROR] dotnet restore failed.%RESET%
    exit /b 1
)
echo %GREEN%    Backend packages restored.%RESET%

REM --- Create database if not exists ---
echo %YELLOW%[4/7] Creating database if not exists...%RESET%
call "%SCRIPT_DIR%database.bat"
if errorlevel 1 (
    echo %RED%[ERROR] Database setup failed.%RESET%
    exit /b 1
)

REM --- EF Core migrations ---
echo %YELLOW%[5/7] Applying EF Core migrations...%RESET%
if exist "%API_PROJECT%" (
    dotnet tool install --global dotnet-ef >nul 2>&1
    dotnet ef database update --project "%API_PROJECT%"
    if errorlevel 1 (
        echo %RED%[ERROR] EF Core migration failed.%RESET%
        exit /b 1
    )
    echo %GREEN%    Migrations applied.%RESET%
) else (
    echo %YELLOW%    [SKIP] API project not found.%RESET%
)

REM --- Seed initial data ---
echo %YELLOW%[6/7] Seeding initial data...%RESET%
set "SEED_SQL=%ROOT_DIR%\database\scripts\seed.sql"
if exist "%SEED_SQL%" (
    where sqlcmd >nul 2>&1
    if not errorlevel 1 (
        sqlcmd -S localhost -d EnterpriseManagement -i "%SEED_SQL%" -b
        if errorlevel 1 (
            echo %YELLOW%    [WARN] Seed script failed (may already be seeded).%RESET%
        ) else (
            echo %GREEN%    Initial data seeded.%RESET%
        )
    ) else (
        echo %YELLOW%    [SKIP] sqlcmd not available; cannot run seed.sql.%RESET%
    )
) else (
    echo %YELLOW%    [SKIP] No seed.sql found.%RESET%
)

REM --- Verify ---
echo %YELLOW%[7/7] Verifying installation...%RESET%
dotnet build "%SOLUTION_FILE%" --configuration Release
if errorlevel 1 (
    echo %RED%[ERROR] Verification build failed.%RESET%
    exit /b 1
)
echo %GREEN%    Verification build succeeded.%RESET%

echo %GREEN%============================================================================
echo  INSTALL COMPLETE
echo ============================================================================%RESET%
echo %CYAN%Next steps:%RESET%
echo   1. Run %SCRIPT_DIR%run.bat to start the API in development mode.
echo   2. Open https://localhost:5001/swagger in your browser.
echo   3. Run %SCRIPT_DIR%publish.bat to create a production package.
exit /b 0
