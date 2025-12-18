# Backend

Node.js + Express API server for Heat Seasons leaderboard application.

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Run development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Health Check

```
GET http://localhost:3001/api/health
```

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Entry point
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── models/           # Data models
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── .env.example          # Environment template
└── package.json
```

## API Documentation

See `/planning/features/api-design-v1.0.md` for full API specification.
