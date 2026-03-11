# Error Handling Migration Plan

## Target Design

- Repositories and storage adapters only throw infrastructure errors for real technical and write failures.
- Read paths return `null` or empty collections when absence is an expected outcome.
- Services translate known infrastructure failures into application errors and preserve the original `cause`.
- Controllers stay thin and delegate failures with `next(error)`.
- Edge middleware logs once and maps application errors to HTTP responses.
- Error translation must preserve the underlying error chain.

## Current Gaps

- Services still throw HTTP-aware `AppError` types directly.
- Many repository and infrastructure paths throw raw `Error` and discard the underlying failure.
- Some controllers and middleware bypass the shared edge handler by writing error responses directly.
- The shared error handler falls back to `400` for unmapped application errors, which can misclassify server-side failures.

## Migration Rules

1. Do not throw infrastructure errors for read misses when `null` is a valid outcome.
2. Do throw typed infrastructure errors for write failures, constraint failures, and storage failures.
3. When mapping errors, always attach the original error as `cause`.
4. Do not log in repositories or services for request failures; log once at the edge.
5. Prefer typed error classes over branching on error message text.

## Phase Plan

### Phase 1: Add Error Primitives

- Extend application errors to carry `details` and `cause` consistently.
- Add infrastructure error classes for storage and repository write failures.
- Keep changes additive so existing code continues to compile.

### Phase 2: Migrate One Vertical Slice

- Start with seasons.
- Replace service-layer `AppError` usage with application errors.
- Update season repository and storage interactions to throw infrastructure errors only for real write failures.
- Update HTTP mapping so season application errors resolve to the correct status codes.

### Phase 3: Normalize Edge Handling

- Remove controller-level custom error response branches where the service should own the semantic outcome.
- Decide whether auth and role middleware remain standalone edge responders or route into the shared error handler.
- Remove the generic `ApplicationError -> 400` fallback.

### Phase 4: Expand Across Domains

- Migrate auth, racer, race, bootstrap, and admin slices.
- Add tests for repository null-return rules, service error translation, and edge response mapping.

## First Concrete Tasks

1. Introduce `InfrastructureError` and its write-failure subclasses.
2. Upgrade `ApplicationError` to support `cause`.
3. Migrate season service off transport-layer errors.
4. Add explicit application-to-HTTP mappings for season errors.