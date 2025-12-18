# Heat Seasons

A leaderboard application for tracking Heat (boardgame) racing seasons.

![Heat Seasons splashscreen](./assets/heat-seasons-splashscreen.png)

## Project Structure

This is a monorepo using npm workspaces with three packages:

```
heat-seasons/
├── packages/
│   ├── backend/       # Node.js + Express API
│   ├── frontend/      # React + Vite UI
│   └── shared/        # Common code and utilities
├── planning/          # Documentation and planning
├── package.json       # Root workspace configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

Install all dependencies for all packages:

```bash
npm install
```

### Development

Run both frontend and backend simultaneously:

```bash
npm run dev
```

Or run them individually:

```bash
# Run backend only (API server on port 3001)
npm run backend

# Run frontend only (UI on port 3000)
npm run frontend
```

### Backend Setup

1. Navigate to backend and copy environment template:

```bash
cd packages/backend
cp .env.example .env
```

2. Edit `.env` with your configuration

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Features

- Track multiple racing seasons
- Record race results (2-9 racers per race)
- Calculate standings with progressive points system
- User authentication with admin/user roles
- Real-time leaderboard updates

## Documentation

- **API Design**: `/planning/features/api-design-v1.0.md`
- **UI Design**: `/planning/design/ui-design-v1.0.md`
- **Architecture**: `/planning/architecture/`
- **Features**: `/planning/features/`

## Tech Stack

### Backend

- Node.js + Express
- JWT authentication
- RESTful API

### Frontend

- React 18
- Vite
- React Router
- Custom CSS

### Shared

- Common utilities
- Validation logic
- Constants and types

## Scripts

```bash
# Development
npm run dev          # Run all packages in dev mode
npm run backend      # Run backend only
npm run frontend     # Run frontend only

# Build
npm run build        # Build all packages

# Testing
npm run test         # Run tests for all packages

# Clean
npm run clean        # Remove all node_modules
```

## License

ISC
