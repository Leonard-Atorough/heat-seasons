# Heat Seasons 🏁

A full-stack leaderboard application for tracking Heat (boardgame) racing seasons. Manage multiple seasons, record race results, and track player standings in real-time.

![Heat Seasons splashscreen](./assets/heat_seasons_splashscreen.png)

## Overview

Heat Seasons is a monorepo application built with modern TypeScript, featuring a robust backend API and an intuitive React frontend. It demonstrates clean architecture principles, proper separation of concerns, and scalable design patterns.

**Key Capabilities:**

- 🏆 Multi-season leaderboard tracking
- 📊 Dynamic race result recording (2-9 racers per race)
- 🔐 User authentication with role-based access (admin/user)
- ⚡ Real-time standings updates with progressive points calculation
- 📱 Responsive, modern UI

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| **Backend**      | Node.js + Express, TypeScript, JWT Auth, RESTful API  |
| **Frontend**     | React 18, Vite, React Router, TypeScript              |
| **Shared**       | Common utilities, validation, constants & types       |
| **Architecture** | Clean Architecture, Service Locator, Storage Adapters |

## Quick Start

### Prerequisites

- Node.js v18+
- npm (included with Node.js)

### Installation & Setup

```bash
# Install all dependencies
npm install

# Copy backend environment config
cd packages/backend
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Run frontend and backend simultaneously (root directory)
npm run dev

# Or run individually
npm run backend    # API server on http://localhost:3001
npm run frontend   # UI on http://localhost:3000
```

**Access Points:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## Project Structure

```
heat-seasons/
├── packages/
│   ├── backend/       # Express API + business logic
│   ├── frontend/      # React application
│   └── shared/        # Shared types & utilities
├── planning/          # Architecture & design docs
└── package.json       # Root workspace config
```

## Available Scripts

```bash
npm run dev       # Development mode (all packages)
npm run build     # Build all packages
npm run test      # Run test suite
npm run clean     # Remove node_modules
```

## Architecture

This project follows **clean architecture** principles with:

- **Separation of Concerns**: API routes, business logic, and data access layers are decoupled
- **Dependency Injection**: Service locator pattern for loose coupling
- **Storage Adapters**: Pluggable storage layer (currently JSON-based, easily replaceable)
- **Type Safety**: End-to-end TypeScript for maintainability

See `/planning/architecture/` for detailed documentation.

## Documentation

- **API Design**: [Core features & endpoints](./planning/features/api-design-v1.0.md)
- **UI Design**: [User flows & components](./planning/design/ui-design-v1.0.md)
- **Architecture**: [Design decisions & patterns](./planning/architecture/CLEAN_ARCHITECTURE_TRANSITION.md)
- **Data Model**: [Entity relationships](./planning/architecture/data-model.md)

## Contributing

This project is currently under active development. See `/planning/` for in-progress features and architectural decisions.

## License

ISC
