#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
  echo "Error: .env file not found!"
  exit 1
fi

# Build and start all services in production mode
echo "Building and starting all services in production mode..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "All services deployed successfully!"
