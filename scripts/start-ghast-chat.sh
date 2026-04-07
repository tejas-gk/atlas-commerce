#!/bin/bash

# Ghast Chat start script for development

echo "🚀 Starting Ghast Chat Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Start infrastructure services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Build and start application services
echo "🔨 Building Ghast Chat Service..."
docker-compose -f docker-compose.dev.yml up -d ghast-chat-service

echo "🌐 Building Ghast Chat Web..."
docker-compose -f docker-compose.dev.yml up -d ghast-chat-web

echo ""
echo "✅ Ghast Chat is running!"
echo ""
echo "📱 Web Interface: http://localhost:3100"
echo "🔌 API Server: http://localhost:8090"
echo "🐘 PostgreSQL: localhost:5432"
echo "📍 Redis: localhost:6379"
echo ""
echo "💡 Tip: View logs with: docker-compose logs -f ghast-chat-service ghast-chat-web"
