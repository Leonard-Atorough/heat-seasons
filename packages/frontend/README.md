# Frontend

React + Vite frontend for Heat Seasons leaderboard application.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Root component
│   ├── App.css           # App styles
│   ├── index.css         # Global styles
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── context/          # React context
│   └── utils/            # Helper functions
├── index.html
├── vite.config.js
└── package.json
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS** - Styling (custom CSS with design system)

## Development

The Vite dev server includes:

- Hot Module Replacement (HMR)
- Proxy to backend API (`/api` → `http://localhost:3001`)
- Fast builds with esbuild
