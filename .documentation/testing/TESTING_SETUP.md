# Testing Setup & Configuration Guide

## Quick Start

### Install Test Dependencies

**Backend:**

```bash
cd packages/backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

**Frontend:**

```bash
cd packages/frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest @types/jest msw identity-obj-proxy
```

### Create Test Scripts

**packages/backend/package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

**packages/frontend/package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ui": "jest --coverage --watch"
  }
}
```

---

## Backend Test Setup

### 1. Create Test Directory Structure

```bash
packages/backend/__tests__/
├── unit/
│   ├── utils/
│   │   ├── jwt.test.ts
│   │   ├── pointsCalculation.test.ts
│   │   └── leaderboardCalculation.test.ts
│   └── api/
│       ├── racer/
│       │   ├── racer.repository.test.ts
│       │   ├── racer.service.test.ts
│       │   └── racer.controller.test.ts
│       ├── season/
│       ├── race/
│       └── leaderboard/
├── integration/
│   ├── workflows/
│   │   ├── raceRecording.integration.test.ts
│   │   └── authentication.integration.test.ts
│   └── setup.ts
└── fixtures/
    └── testData.ts
```

### 2. Jest Configuration

**packages/backend/jest.config.js:**

```javascript
module.exports = {
  displayName: "backend",
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.interface.ts",
    "!src/**/index.ts",
    "!src/env.ts",
    "!src/config/**",
    "!src/containers/**",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  // Q. DO i need these for the backend? It doesn't serve React components, but it does use some modern JS features. Maybe for consistency with the frontend?

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },
};
```

### 3. Test Setup File

**packages/backend/**tests**/setup.ts:**

```typescript
import "dotenv/config";

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.SESSION_SECRET = "test-session-secret";

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### 4. Test Fixtures

**packages/backend/**tests**/fixtures/testData.ts:**

```typescript
import { User, Racer, Season, Race } from "@shared/index";

export const testUsers = {
  admin: {
    id: "admin-1",
    googleId: "google-admin-1",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as User,

  user: {
    id: "user-1",
    googleId: "google-user-1",
    email: "user@test.com",
    name: "Test User",
    role: "user",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as User,
};

export const testRacers = {
  john: {
    id: "racer-1",
    name: "John Doe",
    active: true,
    joinDate: new Date("2026-01-01"),
    team: "Team A",
    teamColor: "#FF0000",
    nationality: "USA",
    age: 30,
  } as Racer,

  jane: {
    id: "racer-2",
    name: "Jane Smith",
    active: true,
    joinDate: new Date("2026-01-01"),
    team: "Team B",
    teamColor: "#0000FF",
    nationality: "USA",
    age: 28,
  } as Racer,
};

export const testSeasons = {
  active: {
    id: "season-1",
    name: "Season 1 2026",
    status: "active",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-06-30"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as Season,
};

export const testRaces = {
  race1: {
    id: "race-1",
    seasonId: "season-1",
    name: "Race 1",
    raceNumber: 1,
    date: new Date("2026-01-15"),
    results: [
      { racerId: "racer-1", position: 1, points: 10 },
      { racerId: "racer-2", position: 2, points: 8 },
    ],
  } as Race,
};
```

### 5. Mock Storage Adapter Helper

**packages/backend/**tests**/mocks/storage.mock.ts:**

```typescript
import { StorageAdapter } from "src/storage/StorageAdapter";

export function createMockStorageAdapter(
  overrides?: Partial<StorageAdapter>,
): jest.Mocked<StorageAdapter> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    ...overrides,
  };
}

export function createInMemoryStorageAdapter(): StorageAdapter {
  const data: Record<string, any[]> = {};

  return {
    async findById(collection: string, id: string) {
      return data[collection]?.find((item) => item.id === id) ?? null;
    },

    async findAll(collection: string, filter?: Record<string, unknown>) {
      let results = data[collection] ?? [];

      if (filter) {
        results = results.filter((item) =>
          Object.entries(filter).every(([key, value]) => item[key] === value),
        );
      }

      return results;
    },

    async create(collection: string, item: any) {
      const withId = { ...item, id: crypto.randomUUID() };
      data[collection] = [...(data[collection] ?? []), withId];
      return withId;
    },

    async update(collection: string, id: string, updates: any) {
      const index = data[collection]?.findIndex((item) => item.id === id) ?? -1;
      const updated = { ...data[collection][index], ...updates };
      data[collection][index] = updated;
      return updated;
    },

    async delete(collection: string, id: string) {
      data[collection] = data[collection]?.filter((item) => item.id !== id) ?? [];
    },

    async exists(collection: string, id: string) {
      return (data[collection] ?? []).some((item) => item.id === id);
    },

    async count(collection: string, filter?: Record<string, unknown>) {
      return (await this.findAll(collection, filter)).length;
    },
  };
}
```

---

## Frontend Test Setup

### 1. Create Test Directory Structure

```bash
packages/frontend/src/__tests__/
├── unit/
│   ├── utils/
│   │   ├── tokenManager.test.ts
│   │   └── validation.test.ts
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useData.test.ts
│   └── services/
│       └── apiClient.test.ts
├── integration/
│   ├── workflows/
│   │   ├── leaderboard.integration.test.tsx
│   │   └── raceRecording.integration.test.tsx
│   └── setup.tsx
├── mocks/
│   ├── handlers.ts
│   └── server.ts
└── fixtures/
    └── testData.ts
```

### 2. Jest Configuration

**packages/frontend/jest.config.js:**

```javascript
module.exports = {
  displayName: "frontend",
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.tsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
};
```

### 3. Frontend Test Setup

**packages/frontend/src/**tests**/setup.tsx:**

```typescript
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;
```

### 4. MSW Setup

**packages/frontend/src/**tests**/mocks/handlers.ts:**

```typescript
import { rest } from "msw";
import { testRacers, testSeasons } from "../fixtures/testData";

export const handlers = [
  // Racers
  rest.get("/api/racers", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: Object.values(testRacers),
      }),
    );
  }),

  rest.post("/api/racers", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          ...req.body,
        },
      }),
    );
  }),

  // Seasons
  rest.get("/api/seasons", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: Object.values(testSeasons),
      }),
    );
  }),

  // Leaderboard
  rest.get("/api/leaderboard/:seasonId", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          seasonId: req.params.seasonId,
          entries: [
            {
              position: 1,
              racerId: "racer-1",
              racerName: "John",
              points: 100,
              racesParticipated: 4,
            },
          ],
        },
      }),
    );
  }),
];
```

**packages/frontend/src/**tests**/mocks/server.ts:**

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### 5. Frontend Test Fixtures

**packages/frontend/src/**tests**/fixtures/testData.ts:**

```typescript
export const testRacers = {
  john: {
    id: "racer-1",
    name: "John Doe",
    active: true,
    joinDate: "2026-01-01",
    team: "Team A",
    teamColor: "#FF0000",
    nationality: "USA",
    age: 30,
  },
  jane: {
    id: "racer-2",
    name: "Jane Smith",
    active: true,
    joinDate: "2026-01-01",
    team: "Team B",
    teamColor: "#0000FF",
    nationality: "USA",
    age: 28,
  },
};

export const testSeasons = {
  active: {
    id: "season-1",
    name: "Season 1 2026",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
  },
};
```

### 6. Test Utilities

**packages/frontend/src/**tests**/utils/render.tsx:**

```typescript
import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AuthProvider } from 'src/providers/AuthProvider';
import { DataProvider } from 'src/providers/DataProvider';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { render };
```

---

## Writing Your First Test

### Backend Unit Test Example

**packages/backend/**tests**/unit/utils/jwt.test.ts:**

```typescript
import { JwtService } from "src/utils/jwt";
import { User } from "@shared/index";
import { testUsers } from "../../fixtures/testData";

describe("JwtService", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = JwtService.generateToken(testUsers.user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const generated = JwtService.generateToken(testUsers.user);
      const decoded = JwtService.verifyToken(generated);

      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(testUsers.user.email);
      expect(decoded?.id).toBe(testUsers.user.id);
    });

    it("should return null for invalid token", () => {
      const result = JwtService.verifyToken("invalid.token.here");

      expect(result).toBeNull();
    });
  });
});
```

Run it:

```bash
cd packages/backend
npm test -- jwt.test.ts
```

### Frontend Unit Test Example

**packages/frontend/src/**tests**/unit/utils/tokenManager.test.ts:**

```typescript
import { TokenManager } from "src/utils/tokenManager";

describe("TokenManager", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("saveToken", () => {
    it("should save token to localStorage", () => {
      const token = "test-jwt-token-12345";

      TokenManager.saveToken(token);

      expect(localStorage.setItem).toHaveBeenCalledWith("authToken", token);
    });
  });

  describe("getToken", () => {
    it("should retrieve token from localStorage", () => {
      const token = "test-jwt-token-12345";
      (localStorage.getItem as jest.Mock).mockReturnValue(token);

      const result = TokenManager.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith("authToken");
      expect(result).toBe(token);
    });

    it("should return null if no token exists", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = TokenManager.getToken();

      expect(result).toBeNull();
    });
  });
});
```

Run it:

```bash
cd packages/frontend
npm test -- tokenManager.test.ts
```

---

## Common Testing Patterns

### Mocking Functions

```typescript
// Simple mock
const mockFn = jest.fn();

// Mock with return value
const mockFn = jest.fn().mockResolvedValue({ id: "1" });

// Mock with implementation
const mockFn = jest.fn((input) => input * 2);

// Verify calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
expect(mockFn).toHaveBeenCalledTimes(2);
```

### Testing Async Functions

```typescript
it("should handle async operations", async () => {
  const mockService = {
    fetch: jest.fn().mockResolvedValue({ data: "success" }),
  };

  const result = await mockService.fetch();

  expect(result.data).toBe("success");
});

it("should handle async errors", async () => {
  const mockService = {
    fetch: jest.fn().mockRejectedValue(new Error("Network error")),
  };

  await expect(mockService.fetch()).rejects.toThrow("Network error");
});
```

### Testing React Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should display data after loading', async () => {
  render(<MyComponent />);

  // Wait for element to appear
  const element = await screen.findByText('Expected Text');
  expect(element).toBeInTheDocument();
});

it('should handle user interactions', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

---

## Debugging Tests

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Single Test File

```bash
npm test -- --testNamePattern="JWT Service"
```

### Debug with Node Inspector

```bash
npm run test:debug
# Then open chrome://inspect
```

### Generate Coverage Report

```bash
npm test -- --coverage
# Opens coverage/lcov-report/index.html in browser
```

---

## CI/CD Integration

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint --workspaces

      - name: Test Backend
        run: npm test -w backend -- --coverage

      - name: Test Frontend
        run: npm test -w frontend -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/backend/coverage/coverage-final.json,./packages/frontend/coverage/coverage-final.json
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/react)
- [Mock Service Worker](https://mswjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
