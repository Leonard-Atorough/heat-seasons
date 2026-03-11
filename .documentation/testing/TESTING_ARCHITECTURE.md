# Backend Testing Architecture

## Goals

- Prefer sociable unit tests around services and domain behavior.
- Keep controller tests thin and focused on HTTP translation.
- Use a small number of route-level integration tests for middleware and wiring.
- Isolate Prisma-specific behavior in repository contract tests.

## Folder Structure

```text
packages/backend/__tests__/
  setup.ts
  fixtures/
    index.ts
    race.fixture.ts
    racer.fixture.ts
    season.fixture.ts
    testData.ts
    user.fixture.ts
  helpers/
    createTestApp.ts
    createTestContainer.ts
    inMemoryStorageAdapter.ts
    requestBuilders.ts
  contracts/
    persistence/
      auth.repository.contract.test.ts
      racer.repository.contract.test.ts
      race.repository.contract.test.ts
      season.repository.contract.test.ts
  integration/
    http/
      auth.routes.test.ts
      admin.routes.test.ts
      racer.routes.test.ts
      race.routes.test.ts
      season.routes.test.ts
      bootstrap.routes.test.ts
  unit/
    api/
      admin/
        admin.controller.test.ts
      auth/
        auth.controller.test.ts
    application/
      services/
        auth.service.test.ts
        racer.service.test.ts
        race.service.test.ts
        season.service.test.ts
        bootstrap.service.test.ts
    domain/
      aggregates/
      entities/
      mappers/
    utils/
      jwt.test.ts
```

## Test Pyramid For This Repo

### 1. Sociable unit tests

Primary target for coverage.

- Test real service classes with real domain entities and mappers.
- Replace infrastructure with in-memory storage or fake repositories.
- Assert business outcomes, persisted state, and thrown errors.
- Avoid asserting collaborator call order unless that order is the behavior.

Best candidates:

- `AuthService`
- `RacerService`
- `RaceService`
- `SeasonService`
- `BootstrapService`

### 2. Thin controller tests

Keep a small number of tests for:

- request parsing
- status code and response envelope shape
- controller-level guards
- forwarding unexpected errors to `next`

Do not duplicate service behavior exhaustively here.

### 3. HTTP integration tests

Use `supertest` against the Express app factory.

- Verify middleware, auth, routing, and serialization together.
- Inject test controllers or a test container.
- Prefer in-memory adapters for speed.
- Add only the highest-value happy paths and authorization failures.

### 4. Persistence contract tests

Use Prisma with a disposable SQLite database.

- Verify repository CRUD behavior and mapper fidelity.
- Cover query-specific behavior that fake storage will not catch.
- Keep these narrower than service tests because they are slower.

## Design Rules

- Routes should depend on injected controllers, not global singletons.
- The app should be created by a factory so tests can assemble only the dependencies they need.
- `src/index.ts` should stay as the runtime entrypoint and call `listen` only.
- Shared builders for test app, auth headers, and in-memory storage belong in `__tests__/helpers/`.

## First Implementation Steps

1. Add `createApp()` that accepts optional injected controllers.
2. Convert each `*.route.ts` file to export a `create*Router()` factory.
3. Keep runtime exports for production by wiring router factories to the default container.
4. Add `createTestApp()` helper that passes fake or real test controllers.
5. Move most new backend coverage to service tests before expanding controller tests.