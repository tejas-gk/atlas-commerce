@echo off
REM Ghast Chat start script for Windows

echo 🚀 Starting Ghast Chat Services...

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Docker is not running. Please start Docker first.
  exit /b 1
)

REM Start infrastructure services
echo 📦 Starting PostgreSQL and Redis...
docker-compose -f docker-compose.dev.yml up -d postgres redis

REM Wait for services to be healthy
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak

REM Build and start application services
echo 🔨 Building Ghast Chat Service...
docker-compose -f docker-compose.dev.yml up -d ghast-chat-service

echo 🌐 Building Ghast Chat Web...
docker-compose -f docker-compose.dev.yml up -d ghast-chat-web

echo.
echo ✅ Ghast Chat is running!
echo.
echo 📱 Web Interface: http://localhost:3100
echo 🔌 API Server: http://localhost:8090
echo 🐘 PostgreSQL: localhost:5432
echo 📍 Redis: localhost:6379
echo.
echo 💡 Tip: View logs with: docker-compose logs -f ghast-chat-service ghast-chat-web
