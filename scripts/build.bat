@echo off
REM ============================================================================
REM  Enterprise Management System - BUILD SCRIPT (Windows)
REM  Builds the backend solution in Release configuration.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\src\backend"
set "SOLUTION_FILE=%BACKEND_DIR%\EnterpriseManagement.sln"
set "OUTPUT_DIR=%ROOT_DIR%\artifacts\build"

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo %CYAN%============================================================================
echo  Enterprise Management System - BUILD
echo ============================================================================%RESET%
echo.

REM --- Record start time (using PowerShell for precision) ---
for /f %%t in ('powershell -NoProfile -Command "Get-Date -UFormat '%%s.%%N'"') do set "START=%%t"

REM --- Check .NET 9 SDK ---
echo %YELLOW%[1/4] Checking .NET 9 SDK...%RESET%
set "DOTNET_OK=0"
for /f "tokens=1,2,3" %%a in ('dotnet --version 2^>nul') do set "DOTNET_VER=%%a"
if defined DOTNET_VER (
    echo     Detected dotnet version: %DOTNET_VER%
    for /f "tokens=1 delims=." %%v in ("%DOTNET_VER%") do (
        if "%%v"=="9" set "DOTNET_OK=1"
    )
)
if "%DOTNET_OK%"=="0" (
    echo %RED%[ERROR] .NET 9 SDK is required but was not found (detected: %DOTNET_VER%).%RESET%
    echo         Download from: https://dotnet.microsoft.com/download/dotnet/9.0
    goto :FAIL
)
echo %GREEN%    .NET 9 SDK is available.%RESET%

REM --- Restore packages ---
echo %YELLOW%[2/4] Restoring NuGet packages...%RESET%
if not exist "%SOLUTION_FILE%" (
    echo %RED%[ERROR] Solution file not found: %SOLUTION_FILE%%RESET%
    goto :FAIL
)
dotnet restore "%SOLUTION_FILE%"
if errorlevel 1 (
    echo %RED%[ERROR] dotnet restore failed.%RESET%
    goto :FAIL
)
echo %GREEN%    Restore completed.%RESET%

REM --- Build ---
echo %YELLOW%[3/4] Building solution (Release)...%RESET%
dotnet build "%SOLUTION_FILE%" --configuration Release --no-restore --output "%OUTPUT_DIR%"
if errorlevel 1 (
    echo %RED%[ERROR] Build failed.%RESET%
    goto :FAIL
)
echo %GREEN%    Build succeeded.%RESET%

REM --- Report ---
echo %YELLOW%[4/4] Finalizing...%RESET%
for /f %%t in ('powershell -NoProfile -Command "Get-Date -UFormat '%%s.%%N'"') do set "END=%%t"
powershell -NoProfile -Command "$d=([double]'%END%'-[double]'%START%'); Write-Host ('    Build duration: ' + [math]::Round($d,2) + ' seconds')"
echo %GREEN%    Output directory: %OUTPUT_DIR%%RESET%

echo %GREEN%============================================================================
echo  BUILD SUCCESSFUL
echo ============================================================================%RESET%

REM --- Open output directory on success ---
explorer "%OUTPUT_DIR%" 2>nul
goto :EOF

:FAIL
echo %RED%============================================================================
echo  BUILD FAILED
echo ============================================================================%RESET%
exit /b 1
