@echo off
echo =========================================
echo FlowBoard Services Test Script
echo =========================================
echo.

REM Check if Docker is running
echo Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Check containers
echo Checking containers...
docker ps --format "{{.Names}}" | findstr /C:"flowboard-postgres" >nul
if %errorlevel% equ 0 (
    echo [OK] flowboard-postgres is running
) else (
    echo [ERROR] flowboard-postgres is NOT running
)

docker ps --format "{{.Names}}" | findstr /C:"flowboard-backend" >nul
if %errorlevel% equ 0 (
    echo [OK] flowboard-backend is running
) else (
    echo [ERROR] flowboard-backend is NOT running
)

docker ps --format "{{.Names}}" | findstr /C:"flowboard-frontend" >nul
if %errorlevel% equ 0 (
    echo [OK] flowboard-frontend is running
) else (
    echo [ERROR] flowboard-frontend is NOT running
)
echo.

REM Test PostgreSQL
echo =========================================
echo Testing PostgreSQL Database
echo =========================================
docker exec flowboard-postgres pg_isready -U flowboard_user -d flowboard >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is ready
) else (
    echo [ERROR] PostgreSQL is not ready
)
echo.

REM Test Backend
echo =========================================
echo Testing Backend API
echo =========================================
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/auth/me >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is responding
) else (
    echo [ERROR] Backend is not responding
)
echo.

REM Test Frontend
echo =========================================
echo Testing Frontend
echo =========================================
curl -s -o nul -w "%%{http_code}" http://localhost:80 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is responding
) else (
    echo [ERROR] Frontend is not responding
)
echo.

echo =========================================
echo Test Summary
echo =========================================
echo.
echo Services Status:
docker compose ps
echo.
echo To view logs:
echo   docker compose logs -f
echo.
echo To stop services:
echo   docker compose down
echo.

pause

