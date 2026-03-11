# Evaluation: Custom Hooks, State Management & Memoization

**Date:** January 26, 2026  
**Project:** Heat Seasons Frontend  
**Focus:** API data fetching, state management, and performance optimization patterns

---

## Executive Summary

Your current implementation has a **solid foundation** with good separation of concerns, but contains **inefficiencies in state management** and **inconsistent memoization patterns** that could impact performance and data consistency as the app scales.

### Key Findings:

- ✅ Good: Custom hooks abstraction, AbortController usage, context-based auth
- ⚠️ Moderate: Inconsistent state patterns, unnecessary `useMemo` usage
- ❌ Critical: Derived state anti-pattern causing sync issues

---

## 1. `useFetch` Hook Analysis

### Current Implementation

```typescript
function useFetch<T, B = any>(
  route: string,
  endpoint?: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: B,
);
```

### Strengths ✅

1. **AbortController Integration** - Prevents memory leaks from race conditions
2. **Overload Signatures** - Type-safe separation of GET (no body) vs POST/PUT/DELETE (body required)
3. **Clean Error Handling** - Distinguishes AbortError from actual errors
4. **Decent Dependencies** - Tracks dependencies for refetching

### Issues ⚠️

#### 1.1 Dependency Array Problem: `JSON.stringify(body)`

```typescript
// ❌ PROBLEM: Inefficient and error-prone
useEffect(() => {
  // ...
}, [route, endpoint, method, JSON.stringify(body)]);
```

**Issues:**

- `JSON.stringify(body)` creates a new string on every render, triggering refetches unnecessarily
- For complex objects, this becomes expensive
- Doesn't handle circular references well

**Recommendation:**

```typescript
// ✅ Better approach: use a custom deep comparison hook
import { useCallback, useRef, useEffect } from "react";

function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>();
  const signalRef = useRef<number>(0);

  if (!deepEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  return ref.current!;
}

// In useFetch:
const memoBody = useDeepCompareMemoize(body);
useEffect(() => {
  // ...
}, [route, endpoint, method, memoBody]);
```

#### 1.2 Missing Loading State Granularity

```typescript
// ❌ Single loading state doesn't distinguish between operations
const [loading, setLoading] = useState<boolean>(true);
```

**Problems:**

- Can't differentiate between initial load vs refetch
- UI can't show different states (e.g., stale data while refetching)
- No way to track specific request state

**Recommendation:**

```typescript
interface FetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  isInitialLoading: boolean; // True only on first fetch
  isRefetching: boolean; // True if fetching after initial load
  isStale: boolean; // True if data exists but is being refetched
}
```

#### 1.3 No Caching Mechanism

Currently, each component that calls `useFetch` makes its own request, even if requesting the same endpoint.

**Recommendation:** Add optional cache layer

```typescript
const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

// Cache key generation
const cacheKey = `${route}${endpoint || ""}:${method}:${JSON.stringify(body)}`;
```

#### 1.4 Error Handling Doesn't Provide Retry Logic

No built-in way to retry failed requests.

**Recommendation:**

```typescript
return {
  data,
  error,
  loading,
  retry: () => {
    // Refetch by toggling a flag that's in dependencies
  },
};
```

---

## 2. Authentication State Management

### AuthProvider Analysis

#### ✅ Strengths

1. **Centralized auth state** - All auth logic in one place
2. **Check auth on mount** - Good practice to verify session
3. **Clear error propagation** - Async operations handled properly

#### ⚠️ Issues

#### 2.1 Mixing HTTP Logic with State Management

```typescript
// ❌ Direct fetch calls in provider
const login = async (email: string, password: string) => {
  const response = await fetch(`${config.authRoute}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // ...
};
```

**Problems:**

- Hard to test (tightly coupled to fetch API)
- Can't reuse auth logic in other contexts
- No request/response interceptors
- Duplicates HTTP error handling logic

**Recommendation:** Create an `AuthService` class:

```typescript
// services/authService.ts
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async login(email: string, password: string): Promise<User> {
    return this.apiClient.post(`/auth/login`, { email, password });
  }

  async logout(): Promise<void> {
    return this.apiClient.post(`/auth/logout`, {});
  }

  async register(email: string, password: string, name: string): Promise<User> {
    return this.apiClient.post(`/auth/register`, { email, password, name });
  }

  async checkAuth(): Promise<User | null> {
    try {
      return await this.apiClient.get(`/auth/me`);
    } catch {
      return null;
    }
  }
}
```

#### 2.2 No Error State in Context

```typescript
// ❌ Missing error information
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // No error or loginError, registrationError, etc.
  login: (email: string, password: string) => Promise<void>;
}
```

**Problem:** Components can't display error messages from auth failures

**Recommendation:**

```typescript
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null; // Add this
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  clearError: () => void; // Add this
}
```

#### 2.3 No Loading State Differentiation

```typescript
// ❌ All operations share single isLoading flag
const [isLoading, setIsLoading] = useState(true);
```

Can't distinguish between login-in-progress vs logout-in-progress vs initial check.

**Recommendation:**

```typescript
const [isCheckingAuth, setIsCheckingAuth] = useState(true);
const [isLoggingIn, setIsLoggingIn] = useState(false);
const [isLoggingOut, setIsLoggingOut] = useState(false);
const [isRegistering, setIsRegistering] = useState(false);
```

#### 2.4 Development Hardcoded Header

```typescript
// ❌ Bad practice - test user ID hardcoded
headers: {
  "X-User-Id": "880e8400-e29b-41d4-a716-446655440000", // Dev only
}
```

**Recommendation:** Use environment variable

```typescript
const response = await fetch(`${config.authRoute}/me`, {
  method: "GET",
  credentials: "include",
  cache: "no-cache",
  ...(import.meta.env.DEV && {
    headers: {
      "X-User-Id": import.meta.env.VITE_DEV_USER_ID,
    },
  }),
});
```

---

## 3. App.tsx State Management

### Current Pattern - Anti-Pattern: Derived State

```typescript
// ❌ CRITICAL ISSUE: Derived state with useMemo
const { data, error, loading } = useFetch<ApiResponse<Standings>>(
  `${config.leaderboardRoute}`,
  "/current",
);

const [leaderboard, setLeaderboard] = useState<Standings>({...});

useMemo(() => {
  if (data && data.data) {
    setLeaderboard(data.data);  // ❌ Side effect in useMemo!
  }
}, [data]);
```

### Problems

1. **`useMemo` is being misused for side effects**
   - `useMemo` returns a memoized value, not for side effects
   - Should use `useEffect` instead
   - Side effects in render phase can cause bugs

2. **State duplication**
   - `data` from hook contains the leaderboard
   - `leaderboard` state duplicates this
   - Creates two sources of truth

3. **Sync issues**
   - If fetch completes but component unmounts, state might not update
   - Potential for stale UI state

### The Correct Pattern

**Option 1: Use data directly (preferred)**

```typescript
const { data, error, loading } = useFetch<ApiResponse<Standings>>(
  `${config.leaderboardRoute}`,
  "/current",
);

// No local state needed - use data.data directly
// Leaderboard component receives data:
<Leaderboard leaderboard={data?.data} loading={loading} error={error} />
```

**Option 2: If transformation needed, use useEffect**

```typescript
const [leaderboard, setLeaderboard] = useState<Standings | null>(null);

// ✅ Use useEffect for side effects, not useMemo
useEffect(() => {
  if (data?.data) {
    setLeaderboard(data.data);
  }
}, [data]);
```

---

## 4. Racers.tsx - Correct Pattern ✅

This component shows the **right approach**:

```typescript
const {
  data: racers,
  error,
  loading,
} = useFetch<ApiResponse<RacerWithStats[]>>(config.racerRoute);

// Derive data without storing in state
const racers = useMemo(() => {
  if (!racers) return [];
  return racers.data
    .map((racer) => ({ ...racer, profileUrl: racer.profileUrl || "..." }))
    .sort((a, b) => a.team.localeCompare(b.team));
}, [racers]);
```

**Why this is better:**

- ✅ Derives transformed data from source
- ✅ Transformation cached with `useMemo`
- ✅ Single source of truth
- ✅ No state duplication
- ✅ `racers` always in sync with `racers`

---

## 5. Memoization Strategy Assessment

### Current Usage

#### ✅ Good: Racers.tsx

```typescript
const racers = useMemo(() => {
  // expensive transformation
  return racers.data.map(...).sort(...);
}, [racers]);
```

- Used correctly for expensive derivations
- Dependency array is correct

#### ⚠️ Problematic: App.tsx

```typescript
useMemo(() => {
  if (data && data.data) {
    setLeaderboard(data.data); // This is useEffect, not useMemo
  }
}, [data]);
```

- Misused as a side-effect mechanism
- Should be `useEffect`

#### ⚠️ Missing Opportunities

No memoization for:

- API service methods in AuthProvider
- Context value object (could cause unnecessary re-renders)

**Fix for context value:**

```typescript
const value: AuthContextType = useMemo(
  () => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  }),
  [user, isLoading, login, logout, register],
);
```

---

## 6. useAuth Hook

### Strengths ✅

- Properly checks for provider existence
- Good error boundary

### Limitations ⚠️

- Doesn't expose individual operation loading states
- No error information
- Can't know which operation failed if multiple async operations exist

---

## Summary of Issues by Severity

### 🔴 Critical

1. **Derived state in App.tsx** - Using `useMemo` for side effects instead of `useEffect`
2. **useAuth missing error state** - Components can't show error messages

### 🟡 High Priority

3. **useFetch dependency array** - `JSON.stringify(body)` causes unnecessary refetches
4. **No caching** - Same endpoint fetched multiple times by different components
5. **HTTP logic mixed with state** - AuthProvider should use a service layer

### 🟠 Medium Priority

6. **Loading state not granular** - Can't distinguish initial load from refetch
7. **No retry mechanism** - Failed requests can't be retried easily
8. **Context value not memoized** - Causes unnecessary re-renders

### 🔵 Low Priority (Best Practices)

9. **Hardcoded dev user ID** - Should use environment variable
10. **No loading states for individual operations** - All auth operations share one flag

---

## Recommended Implementation Plan

### Phase 1: Critical Fixes (Do First)

1. Fix App.tsx derived state: Change `useMemo` to `useEffect`
2. Add error state to AuthContext
3. Create AuthService to separate HTTP logic

### Phase 2: High Impact (Do Next)

4. Improve useFetch dependency array handling
5. Add request caching to useFetch
6. Add granular loading states

### Phase 3: Polish (Nice to Have)

7. Add retry mechanism to useFetch
8. Memoize context value
9. Add operation-specific loading states to auth

---

## Code Examples for Key Fixes

### Fix 1: App.tsx - Correct Derived State

```typescript
// ❌ BEFORE
const { data, error, loading } = useFetch<ApiResponse<Standings>>(
  `${config.leaderboardRoute}`,
  "/current",
);

const [leaderboard, setLeaderboard] = useState<Standings>({...});

useMemo(() => {
  if (data && data.data) {
    setLeaderboard(data.data);
  }
}, [data]);

// ✅ AFTER
const { data, error, loading } = useFetch<ApiResponse<Standings>>(
  `${config.leaderboardRoute}`,
  "/current",
);

// Pass data directly or add useEffect if transformation needed
<Leaderboard leaderboard={data?.data} />
```

### Fix 2: Memoized Context Value

```typescript
const value: AuthContextType = useMemo(() => ({
  user,
  isLoading,
  isAuthenticated: !!user,
  login,
  logout,
  register,
}), [user, isLoading, login, logout, register]);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

### Fix 3: Better useFetch Dependency

```typescript
// Create a utility for deep comparison
function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>();
  const stringifiedValue = JSON.stringify(value);
  const stringifiedRef = useRef<string>("");

  if (stringifiedRef.current !== stringifiedValue) {
    stringifiedRef.current = stringifiedValue;
    ref.current = value;
  }

  return ref.current!;
}

// In useFetch
const memoBody = useDeepCompareMemoize(body);
useEffect(() => {
  // fetch logic
}, [route, endpoint, method, memoBody]);
```

---

## Performance Implications

### Current State

- **Potential re-renders:** Medium (context not memoized)
- **Unnecessary fetches:** High (JSON.stringify in dependencies)
- **Data consistency issues:** Medium (derived state anti-pattern)

### After Fixes

- **Potential re-renders:** Low (memoized context)
- **Unnecessary fetches:** Low (proper dependency handling)
- **Data consistency issues:** None (single source of truth)

---

## Testing Recommendations

1. **Test useFetch**: Verify refetch behavior with body changes
2. **Test auth flow**: Ensure error states are properly displayed
3. **Test data sync**: Verify leaderboard updates immediately after fetch
4. **Test unmount**: Verify no state updates after component unmounts
5. **Performance**: Use React DevTools Profiler to measure re-renders before/after fixes

---

## Conclusion

Your foundation is solid, but there are **several patterns that need correction** to ensure reliability and performance as the application scales. The most critical issue is the misuse of `useMemo` for side effects in App.tsx. Starting with the Phase 1 fixes will address the most impactful issues quickly.

**Estimated effort:**

- Phase 1: 2-3 hours
- Phase 2: 4-5 hours
- Phase 3: 2-3 hours
