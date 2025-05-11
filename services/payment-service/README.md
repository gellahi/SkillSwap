# SkillSwap Payment Service

The Payment Service is a microservice for the SkillSwap freelancing platform that handles all financial transactions using NestJS and PostgreSQL (via Supabase).

## Features

- **Transaction Management**: ACID-compliant transaction processing
- **Escrow System**: Secure escrow funding and milestone-based payments
- **Wallet Management**: Balance tracking and management for users
- **Payment Methods**: Support for multiple payment methods via Stripe
- **Withdrawal Processing**: Secure withdrawal requests and processing
- **Platform Fee Calculation**: Automatic calculation and collection of platform fees

## API Endpoints

### Transactions

- `GET /api/payments/transactions` - Get transaction history
- `GET /api/payments/transactions/:id` - Get transaction details
- `POST /api/payments/transactions` - Create a new transaction
- `PATCH /api/payments/transactions/:id/status` - Update transaction status

### Wallets

- `GET /api/payments/wallets/me` - Get current user's wallet
- `GET /api/payments/wallets/balance` - Get current user's balance
- `GET /api/payments/wallets/:id` - Get wallet by ID
- `POST /api/payments/wallets` - Create a new wallet

### Escrow

- `GET /api/payments/escrows/:id` - Get escrow details
- `GET /api/payments/escrows/project/:projectId` - Get escrows for a project
- `POST /api/payments/escrows` - Create a new escrow
- `POST /api/payments/escrows/:id/fund` - Fund an escrow
- `POST /api/payments/escrows/:id/release-milestone` - Release milestone payment

### Payment Methods

- `GET /api/payments/payment-methods` - Get user's payment methods
- `GET /api/payments/payment-methods/:id` - Get payment method details
- `POST /api/payments/payment-methods` - Add a new payment method
- `PATCH /api/payments/payment-methods/:id` - Update payment method
- `DELETE /api/payments/payment-methods/:id` - Delete payment method

### Withdrawals

- `GET /api/payments/withdrawals` - Get withdrawal history
- `GET /api/payments/withdrawals/:id` - Get withdrawal details
- `POST /api/payments/withdrawals` - Create a withdrawal request
- `POST /api/payments/withdrawals/:id/process` - Process a withdrawal
- `POST /api/payments/withdrawals/:id/cancel` - Cancel a withdrawal

### Stripe Integration

- `POST /api/payments/stripe/setup-intent` - Create a setup intent for adding a payment method
- `POST /api/payments/stripe/payment-methods` - Add a payment method
- `GET /api/payments/stripe/payment-methods` - Get user's Stripe payment methods
- `POST /api/payments/stripe/connected-account` - Create a connected account for a freelancer
- `GET /api/payments/stripe/connected-account/:id` - Get connected account details
- `POST /api/payments/stripe/payment-intent` - Create a payment intent

### Webhooks

- `POST /api/payments/webhooks/stripe` - Stripe webhook endpoint

## Database Schema

### Transactions Table

- `id` - UUID primary key
- `userId` - User ID
- `type` - Transaction type (deposit, withdrawal, escrow_funding, milestone_payment, refund, platform_fee)
- `status` - Transaction status (pending, completed, failed, cancelled)
- `amount` - Transaction amount
- `fee` - Transaction fee
- `sourceWalletId` - Source wallet ID
- `destinationWalletId` - Destination wallet ID
- `escrowId` - Escrow ID
- `projectId` - Project ID
- `milestoneId` - Milestone ID
- `metadata` - Additional metadata
- `description` - Transaction description
- `externalReference` - External reference (e.g., Stripe payment ID)
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Wallets Table

- `id` - UUID primary key
- `userId` - User ID
- `type` - Wallet type (user, platform)
- `balance` - Total balance
- `availableBalance` - Available balance
- `pendingBalance` - Pending balance
- `status` - Wallet status (active, suspended, closed)
- `currency` - Currency code
- `metadata` - Additional metadata
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Escrows Table

- `id` - UUID primary key
- `projectId` - Project ID
- `clientId` - Client ID
- `freelancerId` - Freelancer ID
- `totalAmount` - Total escrow amount
- `fundedAmount` - Amount funded
- `releasedAmount` - Amount released
- `status` - Escrow status (pending, funded, released, refunded, disputed)
- `milestones` - Array of milestone objects
- `metadata` - Additional metadata
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Payment Methods Table

- `id` - UUID primary key
- `userId` - User ID
- `type` - Payment method type (credit_card, bank_account, paypal, stripe)
- `name` - Payment method name
- `status` - Payment method status (active, inactive, pending_verification, verification_failed)
- `externalId` - External ID (e.g., Stripe payment method ID)
- `details` - Payment method details
- `isDefault` - Whether this is the default payment method
- `metadata` - Additional metadata
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Withdrawals Table

- `id` - UUID primary key
- `userId` - User ID
- `amount` - Withdrawal amount
- `fee` - Withdrawal fee
- `netAmount` - Net amount after fees
- `status` - Withdrawal status (pending, processing, completed, failed, cancelled)
- `paymentMethodId` - Payment method ID
- `transactionId` - Transaction ID
- `externalReference` - External reference
- `metadata` - Additional metadata
- `notes` - Additional notes
- `rejectionReason` - Reason for rejection
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp
- `processedAt` - Processing timestamp

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update the environment variables
4. Start the service: `npm run start:dev`

## Environment Variables

- `NODE_ENV` - Environment (development, production)
- `PORT` - Port number (default: 3007)
- `DATABASE_URL` - PostgreSQL connection URL
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_KEY` - Supabase API key
- `JWT_PUBLIC_KEY` - JWT public key for verification
- `JWT_PRIVATE_KEY` - JWT private key for signing
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_ACCOUNT_COUNTRY` - Default country for Stripe accounts
- `AUTH_SERVICE_URL` - Auth service URL
- `PROJECTS_SERVICE_URL` - Projects service URL
- `BIDS_SERVICE_URL` - Bids service URL
- `NOTIFICATIONS_SERVICE_URL` - Notifications service URL
- `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage
- `WITHDRAWAL_FEE_PERCENTAGE` - Withdrawal fee percentage
- `MINIMUM_WITHDRAWAL_AMOUNT` - Minimum withdrawal amount

## Docker

The service can be run using Docker:

```bash
docker build -t skillswap-payment-service .
docker run -p 3007:3007 skillswap-payment-service
```

Or using Docker Compose:

```bash
docker-compose up -d payment-service
```
