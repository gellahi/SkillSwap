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
  /client                  # React frontend application (coming soon)
  /logs                    # Application logs
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/skillswap.git
   cd skillswap
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB Atlas connection string and other configuration values.

5. Start the development server:
   ```
   npm run dev
   ```

## Microservices

### Auth Service
Handles user authentication, registration, and profile management.

### Projects Service
Manages project creation, updates, and search functionality.

### Bids Service
Handles bid submissions, updates, and real-time notifications.

### Messages Service
Provides real-time messaging between clients and freelancers.

### Notifications Service
Manages email, SMS, and in-app notifications.

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Real-time Communication**: Socket.io
- **Frontend**: React, Tailwind CSS (coming soon)
- **State Management**: Zustand or Redux Toolkit (coming soon)

## License

This project is licensed under the ISC License.