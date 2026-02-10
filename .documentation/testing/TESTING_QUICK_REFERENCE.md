# Testing Quick Reference

## Test Structure

```typescript
describe("Feature Name", () => {
  // Setup
  beforeEach(() => {
    // Initialize mocks, fixtures
  });

  // Cleanup
  afterEach(() => {
    // Reset mocks, clear data
  });

  describe("Method Name", () => {
    it("should do something when condition", () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = perform(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

---

## Backend Testing Patterns

### Testing a Service with Mocked Repository

```typescript
describe("RacerService", () => {
  let mockRepository: jest.Mocked<IRacerRepository>;
  let service: RacerService;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new RacerService(mockRepository);
  });

  describe("getAll", () => {
    it("should return all active racers", async () => {
      const racers = [
        { id: "1", name: "John", active: true },
        { id: "2", name: "Jane", active: true },
      ];
      mockRepository.findAll.mockResolvedValue(racers);

      const result = await service.getAll({ active: true });

      expect(result).toEqual(racers);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ active: true });
    });
  });
});
```

### Testing Points Calculation Logic

```typescript
describe("Points Calculation", () => {
  it("should assign correct points for positions", () => {
    expect(calculatePoints(1)).toBe(10);
    expect(calculatePoints(2)).toBe(8);
    expect(calculatePoints(3)).toBe(6);
    expect(calculatePoints(4)).toBe(4);
    expect(calculatePoints(5)).toBe(2);
    expect(calculatePoints(6)).toBe(1);
    expect(calculatePoints(7)).toBe(0);
  });

  it("should handle positions beyond 6", () => {
    expect(calculatePoints(7)).toBe(0);
    expect(calculatePoints(9)).toBe(0);
  });
});
```

### Testing Leaderboard Calculation

```typescript
describe("Leaderboard Calculation", () => {
  it("should aggregate points across multiple races", () => {
    const races = [
      {
        id: "race-1",
        results: [
          { racerId: "1", points: 10 },
          { racerId: "2", points: 8 },
        ],
      },
      {
        id: "race-2",
        results: [
          { racerId: "1", points: 8 },
          { racerId: "2", points: 10 },
        ],
      },
    ];

    const leaderboard = calculateLeaderboard(races);

    expect(leaderboard[0]).toEqual({
      racerId: "2",
      totalPoints: 18,
      racesParticipated: 2,
    });
    expect(leaderboard[1]).toEqual({
      racerId: "1",
      totalPoints: 18,
      racesParticipated: 2,
    });
  });

  it("should sort by points descending", () => {
    const races = [
      {
        results: [
          { racerId: "1", points: 5 },
          { racerId: "2", points: 10 },
          { racerId: "3", points: 8 },
        ],
      },
    ];

    const leaderboard = calculateLeaderboard(races);

    expect(leaderboard[0].racerId).toBe("2"); // 10 points
    expect(leaderboard[1].racerId).toBe("3"); // 8 points
    expect(leaderboard[2].racerId).toBe("1"); // 5 points
  });

  it("should handle ties with consistent ordering", () => {
    const races = [
      {
        results: [
          { racerId: "1", points: 10 },
          { racerId: "2", points: 10 },
        ],
      },
    ];

    const leaderboard = calculateLeaderboard(races);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].totalPoints).toBe(10);
    expect(leaderboard[1].totalPoints).toBe(10);
  });
});
```

### Testing Error Handling

```typescript
describe("Error Handling", () => {
  let mockRepository: jest.Mocked<IRacerRepository>;
  let service: RacerService;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      // ...
    };
    service = new RacerService(mockRepository);
  });

  it("should throw when racer not found", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getById("999")).rejects.toThrow("Racer not found");
  });

  it("should throw when validation fails", async () => {
    const invalidInput = { name: "" }; // Empty name

    await expect(service.create(invalidInput)).rejects.toThrow("Name required");
  });

  it("should propagate repository errors", async () => {
    mockRepository.findById.mockRejectedValue(new Error("Database connection failed"));

    await expect(service.getById("1")).rejects.toThrow("Database connection failed");
  });
});
```

### Testing Controllers

```typescript
describe("RacerController", () => {
  let mockService: jest.Mocked<IRacerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let controller: RacerController;

  beforeEach(() => {
    mockService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      // ...
    };
    controller = new RacerController(mockService);

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("POST /racers", () => {
    it("should return 201 on successful creation", async () => {
      mockRequest.body = { name: "John", email: "john@test.com" };
      const newRacer = { id: "1", ...mockRequest.body };
      mockService.create.mockResolvedValue(newRacer);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ data: newRacer }));
    });

    it("should return 400 for validation errors", async () => {
      mockRequest.body = { email: "john@test.com" }; // Missing name
      mockService.create.mockRejectedValue(new AppError("Name required", 400));

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
```

---

## Frontend Testing Patterns

### Testing Custom Hooks

```typescript
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "src/hooks/useAuth";

describe("useAuth Hook", () => {
  it("should return user when authenticated", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle logout", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Testing Async Data Fetching

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('RacersPage', () => {
  it('should load and display racers', async () => {
    render(<Racers />);

    // Element is not visible immediately
    expect(screen.queryByText('John')).not.toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    server.use(
      rest.get('/api/racers', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(<Racers />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

describe('RacersForm', () => {
  it('should submit form with user input', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<RacersForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@test.com',
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();

    render(<RacersForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
});
```

### Testing Context Providers

```typescript
import { render, screen } from '@testing-library/react';

describe('DataContext', () => {
  it('should provide data to children', () => {
    const TestComponent = () => {
      const { racers } = useData();
      return <div>{racers.length} racers</div>;
    };

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(screen.getByText(/racers/)).toBeInTheDocument();
  });
});
```

### Testing localStorage

```typescript
describe('Token Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist token to localStorage', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).not.toBeNull();
    });
  });

  it('should restore token from localStorage', () => {
    const token = 'test-token-12345';
    localStorage.setItem('authToken', token);

    render(<AuthProvider>
      <App />
    </AuthProvider>);

    expect(localStorage.getItem('authToken')).toBe(token);
  });
});
```

---

## Assertion Examples

### Common Assertions

```typescript
// Equality
expect(value).toBe(5); // Strict equality
expect(obj).toEqual({ id: "1" }); // Deep equality
expect(value).toStrictEqual(expected); // Exact match (no coercion)

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(3.14, 2); // Floating point

// Strings
expect(text).toMatch(/regex/);
expect(text).toContain("substring");
expect(text).toHaveLength(5);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toEqual([1, 2, 3]);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toEqual(expected);

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveLastReturnedWith(value);

// Async
expect(promise).rejects.toThrow();
expect(promise).resolves.toEqual(value);
```

### Custom Matchers

```typescript
// For arrays of objects
expect(racers).toEqual(
  expect.arrayContaining([expect.objectContaining({ id: "1", name: "John" })]),
);

// For function calls
expect(mockFn).toHaveBeenCalledWith(
  expect.any(String),
  expect.objectContaining({ active: true }),
  expect.arrayContaining([1, 2]),
);

// For error messages
expect(() => {
  throwError();
}).toThrow(/specific error message/);
```

---

## Test Data Patterns

### Using Factories

```typescript
function createRacer(overrides?: Partial<Racer>): Racer {
  return {
    id: crypto.randomUUID(),
    name: "Test Racer",
    active: true,
    joinDate: new Date(),
    team: "Team A",
    teamColor: "#FF0000",
    nationality: "USA",
    age: 25,
    ...overrides,
  };
}

// Usage
const racer1 = createRacer();
const racer2 = createRacer({ name: "John", team: "Team B" });
```

### Using Fixtures

```typescript
export const fixtureRacers = {
  john: createRacer({ name: "John", team: "Team A" }),
  jane: createRacer({ name: "Jane", team: "Team B" }),
  inactive: createRacer({ active: false }),
};

// Usage
const { john, jane } = fixtureRacers;
```

---

## Debugging Tips

### Log for Debugging

```typescript
it("should work", () => {
  const result = calculate(5);

  console.log("Result:", result); // Will appear in test output
  console.log("Type:", typeof result);
  console.log("Full object:", JSON.stringify(result, null, 2));

  expect(result).toBe(10);
});
```

### Use screen.debug() in React Tests

```typescript
import { render, screen } from '@testing-library/react';

it('should render correctly', () => {
  render(<Component />);

  screen.debug();  // Prints entire DOM to console
});
```

### Inspect Mock Calls

```typescript
const mockFn = jest.fn();
mockFn("arg1");
mockFn("arg2");

console.log(mockFn.mock.calls); // [['arg1'], ['arg2']]
console.log(mockFn.mock.results); // Results of each call
console.log(mockFn.mock.instances); // 'this' context of calls
```

---

## Common Mistakes to Avoid

### ❌ Not Awaiting Async Operations

```typescript
// Wrong
it("should load data", () => {
  const promise = fetch("/api/data");
  expect(promise).toBeDefined(); // Doesn't wait for promise
});

// Correct
it("should load data", async () => {
  const data = await fetch("/api/data");
  expect(data).toBeDefined();
});
```

### ❌ Testing Implementation Details

```typescript
// Wrong - testing implementation
expect(component.state.count).toBe(1);

// Correct - testing behavior
expect(screen.getByText("Count: 1")).toBeInTheDocument();
```

### ❌ Not Cleaning Up Mocks

```typescript
// Wrong
it("test 1", () => {
  mockFn.mockResolvedValue("result");
  // Mock persists to next test!
});

it("test 2", () => {
  // mockFn still has previous mock
});

// Correct
afterEach(() => {
  jest.clearAllMocks();
});
```

### ❌ Overspecifying Mocks

```typescript
// Wrong - too specific
expect(mockFn).toHaveBeenCalledWith({
  id: "1",
  name: "John",
  email: "j@test.com",
  age: 30,
  team: "A",
});

// Correct - only check what matters
expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ id: "1", name: "John" }));
```

---

## Performance Tips

### Only Test What Matters

- ✅ Business logic
- ✅ Edge cases
- ✅ Error handling
- ❌ Don't test third-party libraries
- ❌ Don't test implementation details
- ❌ Don't test UI rendering extensively

### Optimize Test Speed

```typescript
// Use beforeAll for expensive setup (don't clean between tests)
beforeAll(() => {
  // Initialize database connection once
});

// Use beforeEach only when needed
beforeEach(() => {
  // Clear mock call counts
  jest.clearAllMocks();
});
```

### Parallel Tests

Jest runs tests in parallel by default. Be careful with:

- Shared files
- Database connections
- Port allocations

Use test-specific IDs or isolation to avoid conflicts.
