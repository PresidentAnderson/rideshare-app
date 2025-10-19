# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ridesharing application with the following components:
- **Backend**: Node.js/Express.js API server with PostgreSQL database
- **Frontend Web**: React.js SPA with Redux state management and Tailwind CSS
- **Mobile App**: React Native application sharing Redux patterns with web
- **Infrastructure**: Docker containerization with Kubernetes deployment options

## Architecture

### Backend Structure
The backend follows a layered architecture:
- **Routes** → **Controllers** → **Services** → **Data Access (DAO/ORM)** → **PostgreSQL/Redis**
- External integrations (Stripe, Google Maps) handled through adapter pattern
- Key services: Auth, Rides, Messaging, Payment, Admin

### Frontend Structure
- React.js with Redux for state management
- React Router for navigation
- Axios for HTTP requests
- Tailwind CSS for styling
- Component-based architecture with separate Pages and Components directories

### Mobile App Structure
- React Native with similar Redux patterns as web
- React Navigation for routing
- Async Storage for local persistence
- Shared API communication patterns with web frontend

## Development Commands

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run specific test suite
npm test -- auth.test.js

# Database migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend Web Development
```bash
# Navigate to frontend web directory
cd frontend/web

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run end-to-end tests
npm run cypress

# Build for production
npm run build
```

### Mobile Development
```bash
# Navigate to mobile directory
cd frontend/mobile

# Install dependencies
npm install

# Run iOS simulator
npm run ios

# Run Android emulator
npm run android

# Run tests
npm test
```

### Infrastructure Commands
```bash
# Build Docker images
docker-compose build

# Start services with Docker Compose
docker-compose up

# Run database initialization
./infrastructure/scripts/init-db.sh

# Run database migrations
./infrastructure/scripts/migrate.sh

# Backup database
./infrastructure/scripts/backup-db.sh
```

## Key Patterns and Conventions

### API Endpoints
- RESTful design following `/api/v1/[resource]` pattern
- Authentication via JWT tokens
- Consistent error response format

### State Management
- Redux store organized by feature (user, rides, payments, etc.)
- Actions follow `[FEATURE]_[ACTION]` naming convention
- Async actions handled with Redux Thunk

### Database Schema
- Users table with role-based access (rider, driver, admin)
- Rides table with status tracking
- Payments table integrated with Stripe
- Messages table for in-app communication

### Testing Strategy
- Unit tests for individual services and components
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## Environment Configuration
- Environment variables stored in `.env` files (not committed)
- Config files: `default.env`, `development.env`, `staging.env`, `production.env`
- New Relic monitoring configured via `newrelic.ini`

## External Services
- **Payment Processing**: Stripe API
- **Mapping/Location**: Google Maps API
- **Monitoring**: New Relic (configured with AI monitoring enabled)
- **Logging**: CloudWatch (AWS deployment)
- **CDN**: CloudFront for static assets

## Important Notes
- The project uses PostgreSQL as the primary database with Redis for caching
- Authentication middleware validates JWT tokens on protected routes
- AI validation service mentioned in architecture for fraud detection
- Real-time messaging features likely use WebSocket connections
- Mobile and web frontends share Redux patterns but have separate implementations