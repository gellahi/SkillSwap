# SkillSwap

SkillSwap is a freelancing platform built with MERN stack microservices architecture. It connects clients with freelancers, allowing them to collaborate on projects.

## Project Structure

```
/skillswap
  /services
    /auth                  # Authentication microservice
    /projects              # Projects microservice
    /bids                  # Bids microservice
    /messages              # Messages microservice
    /notifications         # Notifications microservice
  /shared                  # Shared utilities and middleware
    /db-connection         # MongoDB connection utilities
    /middlewares           # Common middleware (auth, error handling)
    /utils                 # Shared utility functions
  /api-gateway             # API Gateway for routing requests
  /frontend                # React frontend application
  /docker                  # Docker configuration files
  /logs                    # Application logs
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/skillswap.git
   cd skillswap
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration values.

### Development

#### Using Docker (Recommended)

1. Make the start script executable:
   ```
   chmod +x start-dev.sh
   ```

2. Start all services:
   ```
   ./start-dev.sh
   ```

3. Stop all services:
   ```
   ./stop-dev.sh
   ```

#### Manual Setup

1. Install dependencies for all services:
   ```
   npm run install-all
   ```

2. Start MongoDB:
   ```
   docker-compose up -d mongodb
   ```

3. Start all services:
   ```
   npm run dev
   ```

## Architecture

### Microservices

#### Auth Service
Handles user authentication, registration, and profile management.

#### Projects Service
Manages project creation, updates, and search functionality.

#### Bids Service
Handles bid submissions, updates, and real-time notifications.

#### Messages Service
Provides real-time messaging between clients and freelancers.

#### Notifications Service
Manages email, SMS, and in-app notifications.

### API Gateway
Acts as a single entry point for all client requests, routing them to the appropriate microservices.

### Frontend
React application with Redux for state management and Tailwind CSS for styling.

## Deployment

### Production Deployment

1. Make the deployment script executable:
   ```
   chmod +x deploy-prod.sh
   ```

2. Deploy to production:
   ```
   ./deploy-prod.sh
   ```

### Manual Deployment

1. Build and start all services:
   ```
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Real-time Communication**: Socket.io
- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **API Gateway**: Express.js, http-proxy-middleware
- **Containerization**: Docker, Docker Compose

## License

This project is licensed under the ISC License.