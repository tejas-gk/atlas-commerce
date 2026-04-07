#!/bin/bash

# Ghast Chat cleanup script

echo "🧹 Cleaning up Ghast Chat services..."

# Stop containers
echo "Stopping Ghast Chat services..."
docker-compose -f docker-compose.dev.yml down

# Remove volumes (optional)
read -p "Remove PostgreSQL data volume? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  docker volume rm $(docker volume ls -q | grep postgres)
  echo "✅ PostgreSQL data cleared"
fi

echo "✅ Cleanup complete"
