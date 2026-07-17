@echo off
REM ============================================================================
REM  Enterprise Management System - DATABASE SCRIPT (Windows)
REM  Checks SQL Server, creates DB, runs SQL scripts, verifies state.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "DB_DIR=%ROOT_DIR%\database"
set "SCRIPTS_DIR=%DB_DIR%\scripts"
set "SERVER=localhost"
set "DBNAME=EnterpriseManagement"

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo %CYAN%============================================================================
echo  Enterprise Management System - DATABASE SETUP
echo  Server: %SERVER%   Database: %DBNAME%
echo ============================================================================%RESET%
echo.

REM --- Check SQL Server connectivity ---
echo %YELLOW%[1/5] Checking SQL Server connectivity...%RESET%
where sqlcmd >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] sqlcmd not found. Install SQL Server command line tools.%RESET%
    exit /b 1
)
sqlcmd -S %SERVER% -Q "SELECT 1" -b >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR] Cannot connect to SQL Server at %SERVER%.%RESET%
    echo %RED%        Verify the server is running and accessible.%RESET%
    exit /b 1
)
echo %GREEN%    Connected to SQL Server.%RESET%

REM --- Create database if not exists ---
echo %YELLOW%[2/5] Creating database if not exists...%RESET%
sqlcmd -S %SERVER% -Q "IF DB_ID('%DBNAME%') IS NULL CREATE DATABASE [%DBNAME%];" -b
if errorlevel 1 (
    echo %RED%[ERROR] Failed to create database.%RESET%
    exit /b 1
)
echo %GREEN%    Database '%DBNAME%' ready.%RESET%

REM --- Run SQL scripts ---
echo %YELLOW%[3/5] Running SQL scripts...%RESET%
set "ORDER=schema indexes stored-procedures views functions seed"
for %%s in (%ORDER%) do (
    set "F=%SCRIPTS_DIR%\%%s.sql"
    if exist "!F!" (
        echo %CYAN%    - %%s.sql%RESET%
        sqlcmd -S %SERVER% -d %DBNAME% -i "!F!" -b
        if errorlevel 1 (
            echo %RED%[ERROR] Failed executing %%s.sql%RESET%
            exit /b 1
        )
    ) else (
        echo %YELLOW%    [SKIP] %%s.sql not found.%RESET%
    )
)
echo %GREEN%    All available SQL scripts executed.%RESET%

REM --- Verify database state ---
echo %YELLOW%[4/5] Verifying database state...%RESET%
for /f "tokens=1" %%c in ('sqlcmd -S %SERVER% -d %DBNAME% -h -1 -Q "SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped=0;"') do set "TBL=%%c"
if "%TBL%"=="" set "TBL=0"
echo %GREEN%    User tables: %TBL%%RESET%

REM --- Show database info ---
echo %YELLOW%[5/5] Database info%RESET%
echo %CYAN%----------------------------------------------------------------------------
sqlcmd -S %SERVER% -d %DBNAME% -h -1 -Q "SELECT name FROM sys.tables WHERE is_ms_shipped=0 ORDER BY name;" -W
echo ----------------------------------------------------------------------------%RESET%

echo %GREEN%============================================================================
echo  DATABASE SETUP COMPLETE
echo ============================================================================%RESET%
exit /b 0
