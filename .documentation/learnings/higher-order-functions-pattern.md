# Higher-Order Functions Pattern for Loading States

**Date:** February 9, 2026  
**Context:** DataProvider state management pattern  
**Difficulty:** Intermediate

## Overview

A **Higher-Order Function (HOF)** is a function that takes functions as arguments or returns a function. The `createWithLoading` pattern wraps async operations to automatically manage loading and error states.

## The Pattern

```typescript
const createWithLoading =
  (setLoading: (loading: boolean) => void, setError: (error: Error | null) => void) =>
  async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      return await asyncFn();
    } catch (error) {
      const err = handleError(error);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
```

## How It Works (Three Layers)

### Layer 1: Configuration

```typescript
createWithLoading(setIsLoading, setError);
```

- Provides React state setters
- Called once, returns a reusable function
- Captures `setLoading` and `setError` in closure

### Layer 2: Generics

```typescript
async <T,>(asyncFn: () => Promise<T>)
```

- Type parameter `<T>` accepts any return type
- Infers the type from your async function
- Enables type-safe chaining

### Layer 3: Execution

```typescript
setLoading(true) → execute → catch errors → setLoading(false)
```

- Handles the standard async flow
- Returns data on success, `null` on failure
- Cleans up state in `finally` block

## Usage Example

### Before (Repetitive)

```typescript
const fetchRacers = async () => {
  setIsLoading(true);
  try {
    const data = await getAllRacers();
    setRacers(data);
  } catch (error) {
    setError(error instanceof Error ? error : new Error("Unknown"));
  } finally {
    setIsLoading(false);
  }
};

const fetchLeaderboard = async () => {
  setIsLoading(true);
  try {
    const data = await getCurrentLeaderboard();
    setLeaderboard(data);
  } catch (error) {
    setError(error instanceof Error ? error : new Error("Unknown"));
  } finally {
    setIsLoading(false);
  }
};
```

### After (DRY)

```typescript
const executeWithLoading = useCallback(createWithLoading(setIsLoading, setError), []);

const fetchRacers = useCallback(async () => {
  const data = await executeWithLoading(() => getAllRacers());
  if (data) setRacers(data);
}, [executeWithLoading]);

const fetchLeaderboard = useCallback(async () => {
  const data = await executeWithLoading(() => getCurrentLeaderboard());
  if (data) setLeaderboard(data);
}, [executeWithLoading]);
```

## Benefits

| Benefit             | Explanation                                      |
| ------------------- | ------------------------------------------------ |
| **DRY Principle**   | Write loading/error logic once, reuse everywhere |
| **Type Safety**     | Generic `<T>` prevents type mismatches           |
| **Consistency**     | All async operations follow same pattern         |
| **Maintainability** | Change error handling in one place               |
| **Composability**   | Easy to add logging, retries, timeout            |
| **Testability**     | Pure function, no side effects in logic          |

## Key Concepts

### Closure

The inner functions "remember" `setLoading` and `setError` even after `createWithLoading` returns:

```typescript
const executor = createWithLoading(setIsLoading, setError);
// executor still has access to setIsLoading and setError!
```

### Generic Type Parameter

TypeScript infers `T` from the async function:

```typescript
executeWithLoading(() => getAllRacers());
// T is inferred as RacerWithStats[]

executeWithLoading(() => getCurrentLeaderboard());
// T is inferred as Leaderboard
```

### Null Return on Error

Always returns `T | null`, allowing safe checks:

```typescript
const data = await executeWithLoading(...);
if (data) { /* use data safely */ }
```

## When to Use This Pattern

✅ **Use when:**

- Multiple async operations need same loading/error handling
- You want to avoid repeating try-catch-finally
- Building reusable state management
- Need type-safe generic wrapper

❌ **Avoid when:**

- Simple one-off async calls (use direct async/await)
- Different error handling needed per operation
- Complexity doesn't justify abstraction

## Related Patterns

- **Observer Pattern** - useState setters observe state changes
- **Decorator Pattern** - Wraps async function with extra behavior
- **Strategy Pattern** - Different strategies (async functions) for same flow

## Further Reading

- TypeScript Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
- Higher-Order Functions: https://javascript.info/higher-order-functions
- Closures in JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
