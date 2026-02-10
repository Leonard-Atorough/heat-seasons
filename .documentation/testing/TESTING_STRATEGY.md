# Heat Seasons - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Heat Seasons application. Testing focuses on **functional business logic** rather than UI implementation, acknowledging that the frontend UI is subject to frequent changes.

**Testing Pyramid:**

```
        / \
       /   \  E2E Tests (Integration)
      /-----\
     /       \ Component Tests (Sociable)
    /---------\
   /           \ Unit Tests (Isolated)
  /-------------\
```

---

## Testing Philosophy

### What We Test

- ✅ Business logic and domain rules
- ✅ Data transformations and calculations
- ✅ API contracts and integration points
- ✅ State management and data flow
- ✅ Error handling and edge cases
- ✅ Utility functions and helpers

### What We DON'T Test

- ❌ UI rendering (buttons, styling, layout)
- ❌ CSS classes and visual presentation
- ❌ Component DOM structure (unless critical to functionality)
- ❌ Third-party library implementations
- ❌ React hooks internals

---

## Backend Testing Strategy

### 1. Unit Tests (Isolated)

**Purpose:** Test individual functions/methods in isolation using mocks

**Framework:** Jest

**Coverage Target:** 80%+ for business logic

#### 1.1 Domain Logic Tests

**Files to test:**

- `src/utils/jwt.ts` - Token generation and verification
- `src/api/*/policies/*` - Business rules (points allocation, validation, etc.)
- Utility functions for calculations (leaderboard, points, stats)

**Example structure:**

```
packages/backend/__tests__/unit/
├── utils/
│   ├── jwt.test.ts
│   ├── pointsCalculation.test.ts
│   └── leaderboardCalculation.test.ts
├── api/
│   ├── racer/policies.test.ts
│   ├── season/policies.test.ts
│   ├── race/policies.test.ts
│   └── leaderboard/policies.test.ts
```

**Test examples:**

```typescript
// utils/jwt.test.ts
describe("JwtService", () => {
  describe("generateToken", () => {
    it("should generate valid JWT token", () => {
      const user = { id: "1", email: "user@test.com", role: "user" };
      const token = JwtService.generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode valid token", () => {
      const user = { id: "1", email: "user@test.com", role: "user" };
      const token = JwtService.generateToken(user);
      const decoded = JwtService.verifyToken(token);
      expect(decoded).toEqual(user);
    });

    it("should return null for invalid token", () => {
      const result = JwtService.verifyToken("invalid-token");
      expect(result).toBeNull();
    });
  });
});
```

#### 1.2 Repository Tests (With Mock Storage)

**Purpose:** Test data access layer with mocked storage

**Files to test:**

- `src/api/*/racer.repository.ts`
- `src/api/*/season.repository.ts`
- `src/api/*/race.repository.ts`

**Approach:** Mock the StorageAdapter, test repository methods

```typescript
// api/racer/racer.repository.test.ts
describe("RacerRepository", () => {
  let mockStorageAdapter: jest.Mocked<StorageAdapter>;
  let racerRepository: RacerRepository;

  beforeEach(() => {
    mockStorageAdapter = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
    };
    racerRepository = new RacerRepository(mockStorageAdapter);
  });

  describe("create", () => {
    it("should create racer with generated id", async () => {
      const input = { name: "John", email: "j@test.com", active: true };
      const expected = { id: expect.any(String), ...input };
      mockStorageAdapter.create.mockResolvedValue(expected);

      const result = await racerRepository.create(input);

      expect(mockStorageAdapter.create).toHaveBeenCalledWith("racers", input);
      expect(result.id).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return filtered racers", async () => {
      const racers = [
        { id: "1", name: "John", active: true },
        { id: "2", name: "Jane", active: false },
      ];
      mockStorageAdapter.findAll.mockResolvedValue(racers);

      const result = await racerRepository.findAll({ active: true });

      expect(mockStorageAdapter.findAll).toHaveBeenCalledWith("racers", { active: true });
      expect(result).toEqual(racers);
    });
  });
});
```

#### 1.3 Service Unit Tests (Sociable - With Mock Dependencies)

**Purpose:** Test service business logic with mocked dependencies

**Files to test:**

- `src/api/*/service.ts`
- Services that orchestrate multiple repositories/utilities

**Approach:** Mock repositories and utilities, test service methods

```typescript
// api/season/season.service.test.ts
describe("SeasonService", () => {
  let mockSeasonRepository: jest.Mocked<ISeasonRepository>;
  let mockRaceRepository: jest.Mocked<IRaceRepository>;
  let seasonService: SeasonService;

  beforeEach(() => {
    mockSeasonRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockRaceRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    seasonService = new SeasonService(mockSeasonRepository, mockRaceRepository);
  });

  describe("getById", () => {
    it("should return season by id", async () => {
      const season = { id: "1", name: "Season 1", status: "active" };
      mockSeasonRepository.findById.mockResolvedValue(season);

      const result = await seasonService.getById("1");

      expect(result).toEqual(season);
      expect(mockSeasonRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw error if season not found", async () => {
      mockSeasonRepository.findById.mockResolvedValue(null);

      await expect(seasonService.getById("999")).rejects.toThrow("Season not found");
    });
  });

  describe("create", () => {
    it("should validate minimum races before creating", async () => {
      const input = { name: "Season 1", startDate: new Date(), endDate: new Date() };

      await expect(seasonService.create(input)).rejects.toThrow(
        "Season must have at least 4 races",
      );
    });
  });
});
```

---

### 2. Component Tests (Sociable)

**Purpose:** Test service/repository interactions without hitting storage

**Framework:** Jest with Supertest (for HTTP layer)

**Coverage Target:** 70%+ for critical paths

#### 2.1 Service Integration Tests

**Files to test:**

- Complete service workflows
- Service-to-service interactions
- Business rule enforcement

```typescript
// api/leaderboard/leaderboard.service.test.ts
describe("LeaderboardService (Sociable)", () => {
  let mockRaceRepository: jest.Mocked<IRaceRepository>;
  let mockRacerRepository: jest.Mocked<IRacerRepository>;
  let leaderboardService: LeaderboardService;

  beforeEach(() => {
    mockRaceRepository = {
      findAll: jest.fn(),
      // ... other methods
    };
    mockRacerRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      // ... other methods
    };
    leaderboardService = new LeaderboardService(mockRaceRepository, mockRacerRepository);
  });

  describe("calculateLeaderboard", () => {
    it("should calculate correct points and standings", async () => {
      const races = [
        {
          id: "1",
          seasonId: "s1",
          results: [
            { racerId: "r1", position: 1, points: 10 },
            { racerId: "r2", position: 2, points: 8 },
          ],
        },
        {
          id: "2",
          seasonId: "s1",
          results: [
            { racerId: "r1", position: 2, points: 8 },
            { racerId: "r2", position: 1, points: 10 },
          ],
        },
      ];
      mockRaceRepository.findAll.mockResolvedValue(races);

      const leaderboard = await leaderboardService.calculateLeaderboard("s1");

      expect(leaderboard.entries[0].racerId).toBe("r2"); // 18 points
      expect(leaderboard.entries[0].points).toBe(18);
      expect(leaderboard.entries[1].racerId).toBe("r1"); // 18 points
    });

    it("should handle races with ties correctly", async () => {
      // Test data with tied positions
      // Verify points allocation matches business rules
    });

    it("should filter inactive racers from leaderboard", async () => {
      // Test that inactive racers don't appear
    });
  });
});
```

#### 2.2 Controller Tests (API Contract Tests)

**Purpose:** Test HTTP endpoints without real database

**Framework:** Jest + Supertest

```typescript
// api/racer/racer.controller.test.ts
describe("RacerController (HTTP)", () => {
  let app: Express.Application;
  let mockRacerService: jest.Mocked<IRacerService>;

  beforeEach(() => {
    mockRacerService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    };

    const controller = new RacerController(mockRacerService);
    app = express();
    app.use(express.json());
    app.get("/api/racers", (req, res) => controller.getAll(req, res));
    app.post("/api/racers", (req, res) => controller.create(req, res));
  });

  describe("GET /api/racers", () => {
    it("should return list of racers", async () => {
      const racers = [
        { id: "1", name: "John", active: true },
        { id: "2", name: "Jane", active: true },
      ];
      mockRacerService.getAll.mockResolvedValue(racers);

      const response = await request(app).get("/api/racers");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(racers);
      expect(response.body.success).toBe(true);
    });

    it("should filter by active status", async () => {
      const activeRacers = [{ id: "1", name: "John", active: true }];
      mockRacerService.getAll.mockResolvedValue(activeRacers);

      const response = await request(app).get("/api/racers").query({ active: "true" });

      expect(response.status).toBe(200);
      expect(mockRacerService.getAll).toHaveBeenCalledWith({ active: "true" });
    });
  });

  describe("POST /api/racers", () => {
    it("should create racer with valid input", async () => {
      const input = { name: "John", email: "john@test.com" };
      const created = { id: "1", ...input };
      mockRacerService.create.mockResolvedValue(created);

      const response = await request(app).post("/api/racers").send(input);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(created);
    });

    it("should return 400 for missing required fields", async () => {
      mockRacerService.create.mockRejectedValue(new AppError("Name is required", 400));

      const response = await request(app).post("/api/racers").send({ email: "john@test.com" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should enforce racer limit (max 9)", async () => {
      mockRacerService.create.mockRejectedValue(new AppError("Maximum 9 racers allowed", 400));

      const response = await request(app).post("/api/racers").send({ name: "Racer 10" });

      expect(response.status).toBe(400);
    });
  });
});
```

---

### 3. Integration Tests

**Purpose:** Test complete workflows with real/integration storage

**Framework:** Jest with test database/storage

**Coverage Target:** 60%+ for critical workflows

#### 3.1 End-to-End Workflow Tests

**Approach:** Use SQLite in-memory database for testing

```typescript
// __tests__/integration/workflows/raceRecording.integration.test.ts
describe("Race Recording Workflow (Integration)", () => {
  let app: Express.Application;
  let testDatabase: StorageAdapter;
  let seasonService: SeasonService;
  let raceService: RaceService;
  let racerService: RacerService;
  let leaderboardService: LeaderboardService;

  beforeAll(async () => {
    // Initialize in-memory SQLite database
    testDatabase = new SqliteStorageAdapter(":memory:");
    await testDatabase.initialize();

    // Set up services with real database
    seasonService = new SeasonService(
      new SeasonRepository(testDatabase),
      new RaceRepository(testDatabase),
    );
    raceService = new RaceService(
      new RaceRepository(testDatabase),
      new RacerRepository(testDatabase),
    );
    racerService = new RacerService(new RacerRepository(testDatabase));
    leaderboardService = new LeaderboardService(
      new RaceRepository(testDatabase),
      new RacerRepository(testDatabase),
    );
  });

  afterEach(async () => {
    // Clear database between tests
    await testDatabase.clear();
  });

  describe("Create Season → Add Racers → Record Races → View Leaderboard", () => {
    it("should complete full season workflow", async () => {
      // 1. Create season
      const season = await seasonService.create({
        name: "Season 1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
      });
      expect(season).toBeDefined();

      // 2. Add racers
      const racer1 = await racerService.create({
        name: "John",
        email: "john@test.com",
        active: true,
      });
      const racer2 = await racerService.create({
        name: "Jane",
        email: "jane@test.com",
        active: true,
      });
      expect(racer1).toBeDefined();
      expect(racer2).toBeDefined();

      // 3. Create races and record results
      const race1 = await raceService.create({
        seasonId: season.id,
        raceNumber: 1,
        name: "Race 1",
        date: new Date("2026-01-15"),
      });

      await raceService.recordResult(race1.id, {
        racerId: racer1.id,
        position: 1,
      });
      await raceService.recordResult(race1.id, {
        racerId: racer2.id,
        position: 2,
      });

      const race2 = await raceService.create({
        seasonId: season.id,
        raceNumber: 2,
        name: "Race 2",
        date: new Date("2026-02-15"),
      });

      await raceService.recordResult(race2.id, {
        racerId: racer1.id,
        position: 2,
      });
      await raceService.recordResult(race2.id, {
        racerId: racer2.id,
        position: 1,
      });

      // 4. Calculate leaderboard
      const leaderboard = await leaderboardService.calculateLeaderboard(season.id);

      expect(leaderboard.entries).toHaveLength(2);
      expect(leaderboard.entries[0].racerId).toBe(racer2.id);
      expect(leaderboard.entries[0].points).toBe(18); // 8 + 10
      expect(leaderboard.entries[1].racerId).toBe(racer1.id);
      expect(leaderboard.entries[1].points).toBe(18); // 10 + 8
    });
  });

  describe("Business Rule Enforcement", () => {
    it("should reject season with fewer than 4 races", async () => {
      const season = await seasonService.create({
        name: "Season 1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
      });

      // Try to mark complete with < 4 races
      await expect(seasonService.complete(season.id)).rejects.toThrow(
        "Season must have at least 4 races",
      );
    });

    it("should reject season with more than 9 racers", async () => {
      const season = await seasonService.create({
        name: "Season 1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
      });

      // Try to add 10 racers
      for (let i = 1; i <= 9; i++) {
        await racerService.create({
          name: `Racer ${i}`,
          email: `racer${i}@test.com`,
          active: true,
        });
      }

      await expect(
        racerService.create({
          name: "Racer 10",
          email: "racer10@test.com",
          active: true,
        }),
      ).rejects.toThrow("Maximum 9 racers allowed");
    });

    it("should handle mid-season racer addition", async () => {
      // Create season and add racer after first race
      // Verify leaderboard only includes racers in completed races
    });

    it("should handle ties in positions correctly", async () => {
      // Create races with tied positions
      // Verify points allocation handles ties
    });
  });
});
```

#### 3.2 Auth Workflow Tests

```typescript
// __tests__/integration/workflows/authentication.integration.test.ts
describe("Authentication Workflow (Integration)", () => {
  let app: Express.Application;
  let userRepository: UserRepository;

  beforeAll(async () => {
    // Set up app with real auth middleware
    app = await setupTestApp();
  });

  describe("OAuth Flow", () => {
    it("should create user on first OAuth login", async () => {
      const response = await request(app)
        .get("/api/auth/google/callback")
        .query({ code: "valid-code" });

      expect(response.status).toBe(302); // Redirect
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return existing user on subsequent login", async () => {
      // First login
      const firstResponse = await request(app)
        .get("/api/auth/google/callback")
        .query({ code: "valid-code" });

      // Second login with same code should return same user
      const secondResponse = await request(app)
        .get("/api/auth/google/callback")
        .query({ code: "valid-code" });

      expect(firstResponse.body).toEqual(secondResponse.body);
    });
  });

  describe("JWT Token Management", () => {
    it("should generate token on successful auth", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@test.com", password: "password" });

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe("string");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/racers")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });
});
```

---

## Frontend Testing Strategy

### 1. Unit Tests for Business Logic

**Purpose:** Test utility functions, hooks, and data transformations

**Framework:** Jest + React Testing Library

**Coverage Target:** 80%+ for utilities

#### 1.1 Utility Function Tests

**Files to test:**

- `src/utils/tokenManager.ts` - Token storage and retrieval
- `src/services/apiClient.ts` - API client wrapper
- Custom hooks that contain logic (`useAuth`, `useAuthToken`)

```typescript
// src/utils/__tests__/tokenManager.test.ts
describe("TokenManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveToken", () => {
    it("should save token to localStorage", () => {
      const token = "test-jwt-token";
      TokenManager.saveToken(token);

      expect(localStorage.getItem("authToken")).toBe(token);
    });
  });

  describe("getToken", () => {
    it("should retrieve token from localStorage", () => {
      const token = "test-jwt-token";
      localStorage.setItem("authToken", token);

      const retrieved = TokenManager.getToken();

      expect(retrieved).toBe(token);
    });

    it("should return null if no token exists", () => {
      const retrieved = TokenManager.getToken();

      expect(retrieved).toBeNull();
    });
  });

  describe("removeToken", () => {
    it("should remove token from localStorage", () => {
      localStorage.setItem("authToken", "test-token");

      TokenManager.removeToken();

      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should detect expired token", () => {
      const expiredToken = createJWT({ exp: Math.floor(Date.now() / 1000) - 100 });

      expect(TokenManager.isTokenExpired(expiredToken)).toBe(true);
    });

    it("should detect valid token", () => {
      const validToken = createJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });

      expect(TokenManager.isTokenExpired(validToken)).toBe(false);
    });
  });
});
```

#### 1.2 API Client Tests

```typescript
// src/services/__tests__/apiClient.test.ts
describe("ApiClient", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = global.fetch as jest.Mock;
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("GET request", () => {
    it("should make authenticated GET request with token", async () => {
      const token = "test-token";
      localStorage.setItem("authToken", token);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "1", name: "John" }),
      });

      const response = await apiClient.get("/api/racers/1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/racers/1"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        }),
      );
      expect(response).toEqual({ id: "1", name: "John" });
    });

    it("should refresh token on 401 response", async () => {
      // Test token refresh logic
    });
  });

  describe("POST request", () => {
    it("should send JSON payload", async () => {
      const token = "test-token";
      localStorage.setItem("authToken", token);
      const payload = { name: "John", email: "john@test.com" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "1", ...payload }),
      });

      await apiClient.post("/api/racers", payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );
    });
  });
});
```

#### 1.3 Custom Hook Tests

```typescript
// src/hooks/__tests__/useAuth.test.ts
describe("useAuth Hook", () => {
  it("should return user data when authenticated", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: "1",
        name: "John",
        email: "john@test.com",
      });
    });
  });

  it("should return null user when not authenticated", () => {
    localStorage.removeItem("authToken");

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
  });

  it("should handle logout", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });
});
```

### 2. Component Tests (Logic-Focused)

**Purpose:** Test component logic and data flow, not UI rendering

**Framework:** Jest + React Testing Library

**Coverage Target:** 70% for data handling logic

#### 2.1 Data Fetching Components

```typescript
// src/pages/__tests__/Racers.test.tsx
describe('Racers Page (Logic)', () => {
  let mockApiClient: jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
  });

  it('should fetch and display racers on mount', async () => {
    const racers = [
      { id: '1', name: 'John', active: true },
      { id: '2', name: 'Jane', active: true },
    ];
    mockApiClient.get.mockResolvedValue({ data: racers });

    const { getByText } = render(<Racers apiClient={mockApiClient} />);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/racers');
      expect(getByText('John')).toBeInTheDocument();
      expect(getByText('Jane')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('API Error'));

    const { getByText } = render(<Racers apiClient={mockApiClient} />);

    await waitFor(() => {
      expect(getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should create racer on form submission', async () => {
    const newRacer = { id: '3', name: 'New Racer', active: true };
    mockApiClient.post.mockResolvedValue({ data: newRacer });

    const { getByRole } = render(<Racers apiClient={mockApiClient} />);

    // Simulate form submission
    const submitButton = getByRole('button', { name: /add racer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/racers', {
        name: 'New Racer',
        email: 'test@example.com',
      });
    });
  });

  it('should delete racer and update list', async () => {
    mockApiClient.delete.mockResolvedValue({});

    const { getByRole, queryByText } = render(
      <Racers apiClient={mockApiClient} initialRacers={[/* ... */]} />
    );

    const deleteButton = getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalled();
      expect(queryByText('John')).not.toBeInTheDocument();
    });
  });
});
```

#### 2.2 Context/State Components

```typescript
// src/contexts/__tests__/DataContext.test.tsx
describe("DataContext", () => {
  it("should provide data to consumers", () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    expect(result.current.racers).toBeDefined();
    expect(result.current.seasons).toBeDefined();
  });

  it("should update racers when race is recorded", async () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const initialRacersCount = result.current.racers.length;

    act(() => {
      result.current.addRacer({ id: "new", name: "New Racer" });
    });

    expect(result.current.racers).toHaveLength(initialRacersCount + 1);
  });
});
```

### 3. Integration Tests

**Purpose:** Test complete features end-to-end with real API

**Framework:** Jest + React Testing Library + Mock Service Worker (MSW)

**Coverage Target:** 60% for critical user flows

#### 3.1 MSW Setup for API Mocking

```typescript
// src/__tests__/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  rest.get("/api/racers", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          { id: "1", name: "John", active: true },
          { id: "2", name: "Jane", active: true },
        ],
      }),
    );
  }),

  rest.post("/api/racers", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: { id: expect.any(String), ...req.body },
      }),
    );
  }),

  rest.get("/api/leaderboard/:seasonId", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          seasonId: req.params.seasonId,
          entries: [
            { position: 1, racerId: "1", racerName: "John", points: 100 },
            { position: 2, racerId: "2", racerName: "Jane", points: 95 },
          ],
        },
      }),
    );
  }),
];
```

#### 3.2 Full Feature Tests

```typescript
// src/__tests__/integration/leaderboard.integration.test.tsx
describe('Leaderboard Feature (Integration)', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should load and display leaderboard', async () => {
    const { getByText } = render(<Leaderboard seasonId="season-1" />);

    await waitFor(() => {
      expect(getByText('John')).toBeInTheDocument();
      expect(getByText('Jane')).toBeInTheDocument();
      expect(getByText('100')).toBeInTheDocument(); // Points
    });
  });

  it('should handle leaderboard calculation with multiple races', async () => {
    server.use(
      rest.get('/api/leaderboard/:seasonId', (req, res, ctx) => {
        return res(
          ctx.json({
            success: true,
            data: {
              entries: [
                // Results from 4+ races with correct point aggregation
              ],
            },
          })
        );
      })
    );

    const { getByText } = render(<Leaderboard seasonId="season-1" />);

    await waitFor(() => {
      // Verify calculations are correct
      expect(getByText('1')).toBeInTheDocument(); // Position 1
    });
  });
});
```

---

## Test Configuration

### Jest Configuration

**File:** `packages/backend/jest.config.js`

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.interface.ts", "!src/**/index.ts", "!src/env.ts"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**File:** `packages/frontend/jest.config.js`

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
};
```

---

## Test Execution

### Running Tests

```bash
# Backend tests
cd packages/backend
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch        # Watch mode

# Frontend tests
cd packages/frontend
npm test
npm test -- --coverage
npm test -- --watch

# All tests
npm test --workspaces
```

### CI/CD Integration

**File:** `.github/workflows/test.yml`

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run backend tests
        run: npm test -w backend -- --coverage

      - name: Run frontend tests
        run: npm test -w frontend -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Coverage Goals

| Layer                     | Target | Rationale                             |
| ------------------------- | ------ | ------------------------------------- |
| Domain/Utils              | 85%+   | Core business logic, critical         |
| Services                  | 75%+   | Orchestration logic, important        |
| Repositories              | 70%+   | Data access, testable with mocks      |
| Controllers               | 65%+   | HTTP contract, tested via integration |
| Frontend Utils            | 80%+   | Client-side logic, important          |
| Frontend Hooks            | 75%+   | Complex state logic                   |
| Frontend Pages/Components | 60%+   | UI-focused, less critical             |

---

## Testing Checklist

### Before Each Feature

- [ ] Identify business logic that needs testing
- [ ] Write unit tests for utility functions
- [ ] Write component tests for services
- [ ] Add integration tests for complete workflows
- [ ] Verify edge cases are covered

### Before Deployment

- [ ] All tests passing
- [ ] Coverage thresholds met
- [ ] No unhandled errors in logs
- [ ] Manual smoke test of critical flows

### Ongoing

- [ ] Update tests when business logic changes
- [ ] Monitor coverage trends
- [ ] Review test effectiveness quarterly
- [ ] Refactor flaky tests

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Supertest](https://github.com/visionmedia/supertest)
- [Mock Service Worker](https://mswjs.io/)
