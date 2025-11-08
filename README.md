# Fuel EU Maritime

A web application for managing maritime fuel compliance and banking operations using a hexagonal architecture approach.

## Overview

This project implements a system for managing maritime fuel compliance, route tracking, and banking operations. It provides functionality for:

- Route management and analysis
- Compliance tracking and reporting
- Banking operations for fuel credits
- Pool management for multiple vessels

## Architecture

The project follows a hexagonal (ports and adapters) architecture pattern, separated into frontend and backend services.

### Backend Architecture

```
├── core/
│   ├── domain/        # Business entities and logic
│   ├── application/   # Use cases and business rules
│   └── ports/         # Interface definitions
├── adapters/
│   ├── inbound/       # HTTP controllers, API endpoints
│   └── outbound/      # Database repositories
└── infrastructure/    # Technical implementations
```

### Frontend Architecture

```
├── core/          # Business logic and state management
├── adapters/      # API integrations
├── infrastructure/# Technical implementations
└── pages/         # UI components and routes
```

## Setup and Installation

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up the database:
   ```bash
   # Create and configure your PostgreSQL database
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Running Backend Tests

```bash
cd backend
npm test
```

### Running Frontend Tests

```bash
cd frontend
npm test
```

## API Examples

### Route Management

```http
POST /api/routes
Content-Type: application/json

{
  "vesselId": "123",
  "startPort": "NLRTM",
  "endPort": "GBLON",
  "distance": 500,
  "fuelConsumption": 25.5
}
```

Response:
```json
{
  "id": "route_123",
  "vesselId": "123",
  "startPort": "NLRTM",
  "endPort": "GBLON",
  "distance": 500,
  "fuelConsumption": 25.5,
  "status": "active"
}
```

### Banking Operations

```http
POST /api/banking/transfer
Content-Type: application/json

{
  "fromAccountId": "acc_123",
  "toAccountId": "acc_456",
  "amount": 100.5,
  "currency": "EUR"
}
```

## Screenshots

[Include screenshots of key application interfaces here]

## Contributing

Please refer to our contribution guidelines in CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.