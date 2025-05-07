#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
docker-compose up -d mongodb mongo-express

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 10

# Start all services in development mode
echo "Starting all services..."
docker-compose up -d auth-service projects-service bids-service messages-service notifications-service api-gateway frontend-dev

echo "All services started successfully!"
echo "MongoDB Express: http://localhost:8081"
echo "API Gateway: http://localhost:3000"
echo "Frontend: http://localhost:5173"
