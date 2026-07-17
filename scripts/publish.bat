@echo off
REM ============================================================================
REM  Enterprise Management System - PUBLISH SCRIPT (Windows)
REM  Publishes backend and frontend, then creates a deployment package.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%ROOT_DIR%\src\backend"
set "FRONTEND_DIR=%ROOT_DIR%\src\frontend"
set "SOLUTION_FILE=%BACKEND_DIR%\EnterpriseManagement.sln"
set "API_PROJECT=%BACKEND_DIR%\EnterpriseManagement.Api\EnterpriseManagement.Api.csproj"
set "DEPLOY_DIR=%ROOT_DIR%\deployment"
set "PUBLISH_DIR=%DEPLOY_DIR%\publish"
set "BACKEND_PUB=%PUBLISH_DIR%\backend"
set "FRONTEND_PUB=%PUBLISH_DIR%\frontend"
set "PACKAGE_DIR=%DEPLOY_DIR%\packages"
set "TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "PACKAGE_FILE=%PACKAGE_DIR%\ems-deploy-%TIMESTAMP%.zip"

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo %CYAN%============================================================================
echo  Enterprise Management System - PUBLISH (Production)
echo ============================================================================%RESET%
echo.

REM --- Build Release ---
echo %YELLOW%[1/5] Building solution (Release)...%RESET%
if not exist "%SOLUTION_FILE%" (
    echo %RED%[ERROR] Solution not found: %SOLUTION_FILE%%RESET%
    exit /b 1
)
dotnet build "%SOLUTION_FILE%" --configuration Release
if errorlevel 1 (
    echo %RED%[ERROR] Build failed.%RESET%
    exit /b 1
)
echo %GREEN%    Build succeeded.%RESET%

REM --- Publish backend ---
echo %YELLOW%[2/5] Publishing backend...%RESET%
if exist "%BACKEND_PUB%" rmdir /s /q "%BACKEND_PUB%"
dotnet publish "%API_PROJECT%" --configuration Release --output "%BACKEND_PUB%" --no-build
if errorlevel 1 (
    echo %RED%[ERROR] Backend publish failed.%RESET%
    exit /b 1
)
echo %GREEN%    Backend published to %BACKEND_PUB%%RESET%

REM --- Publish frontend ---
echo %YELLOW%[3/5] Publishing frontend...%RESET%
if not exist "%FRONTEND_DIR%" (
    echo %YELLOW%    [WARN] Frontend directory not found: %FRONTEND_DIR% (skipping)%RESET%
    goto :PACKAGE
)
if exist "%FRONTEND_PUB%" rmdir /s /q "%FRONTEND_PUB%"
if exist "%FRONTEND_DIR%\package.json" (
    pushd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo %RED%[ERROR] npm install failed.%RESET%
        popd
        exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo %RED%[ERROR] Frontend build failed.%RESET%
        popd
        exit /b 1
    )
    if exist "dist" (
        xcopy /e /i /y "dist\*" "%FRONTEND_PUB%\" >nul
    ) else if exist "build" (
        xcopy /e /i /y "build\*" "%FRONTEND_PUB%\" >nul
    )
    popd
    echo %GREEN%    Frontend published to %FRONTEND_PUB%%RESET%
) else (
    echo %YELLOW%    [WARN] No package.json in frontend; copying source.%RESET%
    xcopy /e /i /y "%FRONTEND_DIR%\*" "%FRONTEND_PUB%\" >nul
)

:PACKAGE
REM --- Create deployment package ---
echo %YELLOW%[4/5] Creating deployment package...%RESET%
if not exist "%PACKAGE_DIR%" mkdir "%PACKAGE_DIR%"
if exist "%PACKAGE_FILE%" del /f /q "%PACKAGE_FILE%"
powershell -NoProfile -Command "Compress-Archive -Path '%PUBLISH_DIR%\*' -DestinationPath '%PACKAGE_FILE%' -Force"
if errorlevel 1 (
    echo %RED%[ERROR] Package creation failed.%RESET%
    exit /b 1
)
echo %GREEN%    Package created: %PACKAGE_FILE%%RESET%

REM --- Summary ---
echo %YELLOW%[5/5] Publish summary%RESET%
echo %CYAN%----------------------------------------------------------------------------
echo  Backend : %BACKEND_PUB%
echo  Frontend: %FRONTEND_PUB%
echo  Package : %PACKAGE_FILE%
echo ----------------------------------------------------------------------------%RESET%
for /f %%s in ('powershell -NoProfile -Command "(Get-Item '%PACKAGE_FILE%').Length / 1MB"') do set "PKG_MB=%%s"
echo %GREEN%    Package size: %PKG_MB% MB%RESET%
echo %GREEN%============================================================================
echo  PUBLISH SUCCESSFUL
echo ============================================================================%RESET%
exit /b 0
