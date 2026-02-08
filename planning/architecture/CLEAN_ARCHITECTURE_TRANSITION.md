# Clean Architecture Transition Plan - Backend

**Document Date:** February 8, 2026  
**Status:** Planning Phase  
**Focus:** Heat Seasons Backend - Complete Clean Architecture Refactoring

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Clean Architecture Vision](#clean-architecture-vision)
4. [Directory Structure](#directory-structure)
5. [Transition Phases](#transition-phases)
6. [Phase Details](#phase-details)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Testing Strategy](#testing-strategy)
9. [Success Metrics](#success-metrics)

---

## Executive Summary

The Heat Seasons backend is transitioning from a basic layered architecture (Controllers → Services → Repositories) to a **true clean architecture** that emphasizes:

- **Independence from frameworks** (Express, storage adapters)
- **Clear dependency inversion** (inner layers don't depend on outer layers)
- **Business logic isolation** (use cases/interactors contain all rules)
- **Testability** (business logic tests without frameworks)
- **Scalability** (easy to add new features without cascading changes)

### Current Strengths

✅ Repository pattern already in place  
✅ Service layer exists  
✅ Storage adapter abstraction implemented  
✅ Dependency injection container established  
✅ TypeScript with strong typing

### Current Gaps

❌ Business logic mixed with framework concerns  
❌ No use case/interactor layer (thin services)  
❌ Limited request/response DTOs  
❌ No domain-driven design (entities, value objects)  
❌ Error handling scattered across layers  
❌ No cross-cutting concerns management (logging, caching)  
❌ Missing validators and business rule enforcement

---

## Current State Assessment

### Current Architecture Diagram

```
Request → Controller → Service → Repository → Storage Adapter → Database
          (Express)   (Thin)    (Interface)  (JSON/Future DB)
```

### Current Layer Responsibilities

| Layer               | Current State           | Issues                    |
| ------------------- | ----------------------- | ------------------------- |
| **Controller**      | HTTP request handling   | Mixed with business logic |
| **Service**         | Repository delegator    | Too thin, no domain rules |
| **Repository**      | Data access abstraction | Depends on storage        |
| **Storage Adapter** | Database abstraction    | Only basic CRUD           |
| **Models**          | Shared models           | No domain/DTO separation  |

### Code Examples of Current Issues

1. **Thin Service Layer** - Just delegates to repository

```typescript
// racer.service.ts - Business logic missing!
async getAll(filters?: { active?: boolean }): Promise<RacerWithStats[]> {
  const racers = await this.racerRepository.findAll(filters);
  return racers.map((racer) => ({ ...racer, stats: null }));
}
```

2. **Error Handling Inconsistency** - AppError exists but not systematically used
3. **No Request/Response Validation** - Controllers accept raw Request objects
4. **Missing Business Rules** - Where does "points calculation" live?

---

## Clean Architecture Vision

### Target Architecture Layers (Inside Out)

```
┌─────────────────────────────────────────────────────────────┐
│                 Frameworks & Drivers (Outermost)             │
│  Express, Passport, Storage Adapters, External APIs         │
├─────────────────────────────────────────────────────────────┤
│                 Interface Adapters (Controllers, Gateways)   │
│  HTTP Controllers, Request/Response Handlers, DTOs           │
├─────────────────────────────────────────────────────────────┤
│              Application Services (Use Cases, Interactors)   │
│  Orchestration, Validation, Cross-cutting Concerns           │
├─────────────────────────────────────────────────────────────┤
│                 Enterprise Business Rules (Domain)           │
│  Entities, Value Objects, Domain Services, Policies          │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Inner layers (domain) never depend on outer layers
2. **Business Logic Independence**: Core rules work without Express/Storage
3. **Separation of Concerns**: Each layer has one reason to change
4. **Interfaces Over Implementations**: Depend on abstractions
5. **Single Responsibility**: Each class has one job

### Target Architecture Diagram

```
HTTP Request
    ↓
┌─────────────────────────────┐
│   HTTP Controller           │ ← Handles HTTP concerns only
│   (Request → DTO → Usecase) │
└──────────┬──────────────────┘
           ↓
┌──────────────────────────────┐
│   Use Case / Interactor      │ ← Orchestrates business logic
│   (Business Rules Execution) │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────────┐
│   Domain Services & Policies     │ ← Core business rules
│   Entities, Value Objects        │
└──────────┬──────────────────────┘
           ↓
┌──────────────────────────────────┐
│   Repository Interface           │ ← Abstraction for persistence
└──────────┬──────────────────────┘
           ↓
┌──────────────────────────────────┐
│   Storage Adapter Implementation │ ← Framework-specific
│   (JSON/Prisma/MongoDB)          │
└──────────────────────────────────┘
```

---

## Directory Structure

### Target Directory Organization

```
packages/backend/src/
├── domain/                                    # Enterprise Business Rules (Innermost)
│   ├── entities/
│   │   ├── Season.ts
│   │   ├── Race.ts
│   │   ├── Racer.ts
│   │   └── RaceResult.ts
│   ├── value-objects/
│   │   ├── RacerId.ts
│   │   ├── SeasonId.ts
│   │   ├── Points.ts
│   │   └── Position.ts
│   ├── policies/
│   │   ├── PointsAllocationPolicy.ts         # Business rule: how points are awarded
│   │   ├── RacerActivePolicy.ts
│   │   └── LeaderboardCalculationPolicy.ts
│   └── errors/
│       ├── DomainError.ts
│       ├── RacerNotFound.ts
│       ├── InvalidPointsError.ts
│       └── ...
│
├── application/                              # Application Services (Use Cases)
│   ├── use-cases/
│   │   ├── season/
│   │   │   ├── GetAllSeasonsUseCase.ts
│   │   │   ├── GetSeasonByIdUseCase.ts
│   │   │   ├── CreateSeasonUseCase.ts
│   │   │   ├── UpdateSeasonUseCase.ts
│   │   │   └── DeleteSeasonUseCase.ts
│   │   ├── race/
│   │   │   └── [Similar structure]
│   │   ├── racer/
│   │   │   └── [Similar structure]
│   │   ├── leaderboard/
│   │   │   ├── GetLeaderboardUseCase.ts
│   │   │   └── CalculateLeaderboardUseCase.ts
│   │   └── ...
│   ├── dtos/                                 # Request/Response Models (Framework-independent)
│   │   ├── season/
│   │   │   ├── CreateSeasonRequest.ts
│   │   │   ├── UpdateSeasonRequest.ts
│   │   │   └── SeasonResponse.ts
│   │   ├── race/
│   │   │   └── [Similar structure]
│   │   ├── racer/
│   │   │   └── [Similar structure]
│   │   └── ...
│   ├── ports/                                # Repository Interfaces (abstraction)
│   │   ├── SeasonRepository.ts
│   │   ├── RaceRepository.ts
│   │   ├── RacerRepository.ts
│   │   ├── RaceResultRepository.ts
│   │   └── StorageAdapter.ts
│   ├── validators/                           # Input Validation
│   │   ├── CreateSeasonValidator.ts
│   │   ├── CreateRacerValidator.ts
│   │   └── ...
│   └── services/                             # Application Services (Orchestrators)
│       ├── leaderboard/
│       │   └── LeaderboardService.ts         # Computes leaderboard
│       └── ...
│
├── infrastructure/                           # Adapters & Interfaces
│   ├── persistence/                          # Repository Implementations
│   │   ├── SeasonRepositoryImpl.ts
│   │   ├── RaceRepositoryImpl.ts
│   │   ├── RacerRepositoryImpl.ts
│   │   ├── RaceResultRepositoryImpl.ts
│   │   └── mappers/
│   │       ├── SeasonMapper.ts               # Domain ↔ Storage mapping
│   │       └── ...
│   ├── storage/                              # Storage Adapters (keep existing)
│   │   ├── StorageAdapter.ts
│   │   ├── JsonStorageAdapter.ts
│   │   └── PrismaStorageAdapter.ts           # Future
│   ├── config/
│   │   └── passport.ts
│   ├── external/                             # External service adapters
│   │   └── (if needed)
│   └── mappers/
│       └── RequestResponseMapper.ts          # HTTP ↔ DTO mapping
│
├── presentation/                             # HTTP Interface Layer
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── season/
│   │   │   │   └── SeasonController.ts
│   │   │   ├── race/
│   │   │   │   └── RaceController.ts
│   │   │   ├── racer/
│   │   │   │   └── RacerController.ts
│   │   │   └── leaderboard/
│   │   │       └── LeaderboardController.ts
│   │   ├── routes/
│   │   │   ├── seasonRoutes.ts
│   │   │   ├── raceRoutes.ts
│   │   │   ├── racerRoutes.ts
│   │   │   └── leaderboardRoutes.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts               # Express error handling
│   │   │   ├── requestLogger.ts
│   │   │   ├── authMiddleware.ts
│   │   │   └── validationMiddleware.ts
│   │   └── express-app.ts                    # Express app factory
│   └── rest-api.md                           # API documentation
│
├── shared/                                   # Shared across layers
│   ├── constants.ts
│   ├── types.ts
│   └── utils/
│       ├── logger.ts
│       ├── Result.ts                         # Success/Failure wrapper
│       └── ...
│
├── di/                                       # Dependency Injection
│   ├── Container.ts                          # DI container (refactored)
│   └── ServiceLocator.ts
│
├── index.ts                                  # Entry point
└── config.ts                                 # Configuration

packages/backend/
├── tests/                                    # Tests mirror src/ structure
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── policies/
│   │   │   └── ...
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── services/
│   │   └── infrastructure/
│   ├── integration/
│   │   ├── repositories/
│   │   └── use-cases/
│   └── e2e/
│       └── api/
```

---

## Transition Phases

### Overview Timeline

| Phase       | Duration | Key Activities                              | Deliverables                        |
| ----------- | -------- | ------------------------------------------- | ----------------------------------- |
| **Phase 1** | Week 1   | Domain layer definition, use case structure | Domain entities, use cases skeleton |
| **Phase 2** | Week 2   | Repository implementations, mappers         | Persistence layer complete          |
| **Phase 3** | Week 2   | Use case implementations, validators        | Business logic complete             |
| **Phase 4** | Week 1.5 | Controller refactoring, HTTP layer          | Presentation layer complete         |
| **Phase 5** | Week 1   | Error handling, middleware                  | Cross-cutting concerns              |
| **Phase 6** | Week 1   | Testing, DI updates                         | Full test coverage                  |
| **Phase 7** | Ongoing  | Documentation, optimization                 | Living documentation                |

### Phase Execution Order

1. **Domain Layer** (innermost, no dependencies)
2. **Application Layer** (depends on domain only)
3. **Infrastructure Layer** (depends on domain + application)
4. **Presentation Layer** (depends on all)
5. **Cross-cutting Concerns**
6. **Testing & Optimization**

---

## Phase Details

### Phase 1: Domain Layer Definition (Week 1)

#### 1.1 Domain Entities

**Objectives:**

- Create immutable entity classes
- Define entity identities (strong typing with Value Objects)
- Move business logic from services to entities

**Tasks:**

```
✓ Create domain/entities/Season.ts
  - Properties: id, name, startDate, endDate, status, createdAt, updatedAt
  - Methods: canAcceptRaces(), complete(), archive()
  - Invariants: startDate <= endDate, name required

✓ Create domain/entities/Race.ts
  - Properties: id, seasonId, raceNumber, raceName, date, status
  - Methods: recordResult(), canAddResult()
  - Invariants: raceNumber unique per season

✓ Create domain/entities/Racer.ts
  - Properties: id, name, email, joinDate, status
  - Methods: activate(), deactivate(), isActive()
  - Invariants: name and email required, email unique validation

✓ Create domain/entities/RaceResult.ts
  - Properties: id, raceId, racerId, position, points
  - Methods: isValid(), recalculatePoints()
  - Invariants: position 1-9, points >= 0

✓ Create domain/entities/Leaderboard.ts
  - Properties: seasonId, entries (RacerPoints[])
  - Methods: recalculate(), getPosition(racerId)
```

**Success Criteria:**

- All entities compile with no errors
- Entities have clear invariants documented
- No Express or Storage references in entities

#### 1.2 Value Objects

**Objectives:**

- Create strongly-typed primitive replacements
- Ensure immutability and encapsulation

**Tasks:**

```
✓ Create domain/value-objects/RacerId.ts
✓ Create domain/value-objects/SeasonId.ts
✓ Create domain/value-objects/Points.ts
✓ Create domain/value-objects/Position.ts
✓ Create domain/value-objects/RaceNumber.ts

Each with:
- Validation in constructor
- Immutability
- equals() and toString() methods
- Private constructor + factory method pattern
```

#### 1.3 Domain Policies & Rules

**Objectives:**

- Extract business rules from services
- Create testable policy objects

**Tasks:**

```
✓ Create domain/policies/PointsAllocationPolicy.ts
  - Logic: positions 1-9 allocation
  - Method: calculatePoints(position: Position): Points
  - Used by RaceResult

✓ Create domain/policies/LeaderboardCalculationPolicy.ts
  - Logic: aggregation of points per racer per season
  - Method: calculateLeaderboard(races, results): LeaderboardEntry[]

✓ Create domain/policies/RacerActivePolicy.ts
  - Logic: determines if racer can participate
  - Method: canParticipate(racer): boolean
```

#### 1.4 Domain Errors

**Objectives:**

- Create domain-specific exceptions
- Replace generic errors with meaningful ones

**Tasks:**

```
✓ Create domain/errors/DomainError.ts (base class)
✓ Create domain/errors/RacerNotFoundError.ts
✓ Create domain/errors/SeasonNotFoundError.ts
✓ Create domain/errors/RaceNotFoundError.ts
✓ Create domain/errors/InvalidPointsError.ts
✓ Create domain/errors/InvalidPositionError.ts
✓ Create domain/errors/RacerNotActiveError.ts

Each with:
- Meaningful message
- Optional context data
- Specific type for error handling
```

**Deliverable:**

- Domain folder fully implemented
- 20+ domain classes with tests
- Clear separation of concerns

---

### Phase 2: Application Layer - Use Cases (Week 2)

#### 2.1 Use Case Structure

**Objectives:**

- Define orchestration layer
- Create command/query separation
- Implement Request/Response DTOs

**Tasks:**

```
✓ Create application/use-cases/BaseUseCase.ts (abstract)
  abstract execute(request: RequestDTO): Promise<ResponseDTO>

✓ Create application/use-cases/season/
  - GetAllSeasonsUseCase
  - GetSeasonByIdUseCase
  - CreateSeasonUseCase
  - UpdateSeasonUseCase
  - DeleteSeasonUseCase
  - ListRacesForSeasonUseCase

✓ Create application/use-cases/race/
  - GetRaceByIdUseCase
  - CreateRaceUseCase
  - UpdateRaceUseCase
  - RecordRaceResultUseCase
  - GetRaceResultsUseCase

✓ Create application/use-cases/racer/
  - GetAllRacersUseCase
  - GetRacerByIdUseCase
  - CreateRacerUseCase
  - UpdateRacerUseCase
  - GetRacerStatsUseCase

✓ Create application/use-cases/leaderboard/
  - GetLeaderboardUseCase
  - CalculateLeaderboardUseCase
```

#### 2.2 DTOs (Request/Response Models)

**Objectives:**

- Decouple HTTP layer from business logic
- Validate input at application boundary

**Tasks:**

```
✓ Create application/dtos/season/
  - CreateSeasonRequest: { name, startDate, endDate }
  - UpdateSeasonRequest: { name?, endDate? }
  - SeasonResponse: { id, name, startDate, endDate, status, raceCount }
  - SeasonListResponse: SeasonResponse[]

✓ Create application/dtos/race/
  - CreateRaceRequest: { seasonId, raceNumber, raceName, date }
  - RecordResultRequest: { racerId, position }
  - RaceResponse: { id, seasonId, raceNumber, raceName, date }
  - RaceDetailResponse: { ...RaceResponse, results: RaceResultResponse[] }

✓ Create application/dtos/racer/
  - CreateRacerRequest: { name, email }
  - UpdateRacerRequest: { name?, email?, active? }
  - RacerResponse: { id, name, email, joinDate, active }
  - RacerStatsResponse: { racerId, totalRaces, totalPoints, avgPosition }

✓ Create application/dtos/leaderboard/
  - LeaderboardEntryResponse: { position, racerId, racerName, points, racesParticipated }
  - LeaderboardResponse: { seasonId, entries, calculatedAt }

✓ Create application/dtos/common/
  - ErrorResponse: { success: false, error, timestamp }
  - SuccessResponse<T>: { success: true, data, timestamp }
```

#### 2.3 Port Interfaces (Repository Contracts)

**Objectives:**

- Define repository contracts without implementation
- Enable dependency inversion

**Tasks:**

```
✓ Create application/ports/SeasonRepository.ts
  interface with methods:
  - findAll(filter?): Promise<Season[]>
  - findById(id): Promise<Season | null>
  - create(data): Promise<Season>
  - update(id, data): Promise<Season>
  - delete(id): Promise<void>
  - existsById(id): Promise<boolean>

✓ Create application/ports/RaceRepository.ts
  interface with methods:
  - findAll(seasonId?): Promise<Race[]>
  - findById(id): Promise<Race | null>
  - findBySeason(seasonId): Promise<Race[]>
  - create(data): Promise<Race>
  - update(id, data): Promise<Race>
  - delete(id): Promise<void>

✓ Create application/ports/RacerRepository.ts
✓ Create application/ports/RaceResultRepository.ts

✓ Create application/ports/StorageAdapter.ts (refactor existing)
```

#### 2.4 Validators

**Objectives:**

- Validate input before use case execution
- Provide clear error messages

**Tasks:**

```
✓ Create application/validators/CreateSeasonValidator.ts
  - name: required, 3-100 chars
  - startDate: required, valid date
  - endDate: optional, > startDate

✓ Create application/validators/CreateRacerValidator.ts
  - name: required, 2-100 chars
  - email: valid email format

✓ Create application/validators/CreateRaceValidator.ts
  - seasonId: required, valid UUID
  - raceNumber: required, positive integer
  - raceName: required, non-empty
  - date: required, valid date, not in past

✓ Create application/validators/BaseValidator.ts (abstract)
  abstract validate(data: unknown): ValidationResult
```

**Deliverable:**

- 30+ use cases implemented
- Complete DTO set
- Repository port interfaces
- Input validators

---

### Phase 3: Infrastructure Layer (Week 2)

#### 3.1 Repository Implementations

**Objectives:**

- Implement port interfaces
- Map domain entities to storage format

**Tasks:**

```
✓ Create infrastructure/persistence/SeasonRepositoryImpl.ts
  - Inject StorageAdapter
  - Use SeasonMapper to map entities
  - Implement all SeasonRepository methods
  - Handle errors and map to domain errors

✓ Create infrastructure/persistence/RaceRepositoryImpl.ts
✓ Create infrastructure/persistence/RacerRepositoryImpl.ts
✓ Create infrastructure/persistence/RaceResultRepositoryImpl.ts

Each with:
- Constructor injection of storage adapter
- Use of mappers
- Error transformation
- Proper async/await
```

#### 3.2 Mappers (Domain ↔ Storage)

**Objectives:**

- Separate domain objects from storage format
- Enable flexible storage changes

**Tasks:**

```
✓ Create infrastructure/persistence/mappers/SeasonMapper.ts
  - toDomain(raw): Season
  - toPersistence(season): StorageFormat
  - toDTO(season): SeasonResponse

✓ Create infrastructure/persistence/mappers/RaceMapper.ts
✓ Create infrastructure/persistence/mappers/RacerMapper.ts
✓ Create infrastructure/persistence/mappers/RaceResultMapper.ts

Each with:
- Bi-directional mapping
- Type safety
- DTO conversion
```

#### 3.3 Application Services

**Objectives:**

- Implement cross-cutting orchestration
- Realize use cases

**Tasks:**

```
✓ Create infrastructure/services/LeaderboardService.ts
  - Inject RaceRepository, RaceResultRepository, RacerRepository
  - Implement: calculateLeaderboard(seasonId): Promise<Leaderboard>
  - Use PointsAllocationPolicy and LeaderboardCalculationPolicy
  - Return Leaderboard entity

✓ Create infrastructure/services/AuthenticationService.ts
  - If needed for auth operations
```

**Deliverable:**

- All repository implementations complete
- Bidirectional mappers
- Application services
- Storage adapter abstraction

---

### Phase 4: Presentation Layer - HTTP Controllers (Week 1.5)

#### 4.1 Controller Refactoring

**Objectives:**

- Controllers handle HTTP only
- Delegate to use cases
- Request/response mapping

**Tasks:**

```
✓ Create presentation/http/controllers/season/SeasonController.ts
  class SeasonController {
    constructor(
      private getSeasonUseCase: GetSeasonByIdUseCase,
      private getAllSeasonsUseCase: GetAllSeasonsUseCase,
      private createSeasonUseCase: CreateSeasonUseCase,
      private updateSeasonUseCase: UpdateSeasonUseCase,
      private deleteSeasonUseCase: DeleteSeasonUseCase
    ) {}

    async getAll(req: Request, res: Response, next: NextFunction) {
      try {
        const request: GetAllSeasonsRequest = { filter: req.query };
        const response = await this.getAllSeasonsUseCase.execute(request);
        res.json(response);
      } catch (error) {
        next(error);
      }
    }

    async getById(req: Request, res: Response, next: NextFunction) { ... }
    async create(req: Request, res: Response, next: NextFunction) { ... }
  }

✓ Create presentation/http/controllers/race/RaceController.ts
✓ Create presentation/http/controllers/racer/RacerController.ts
✓ Create presentation/http/controllers/leaderboard/LeaderboardController.ts
```

#### 4.2 Routes Refactoring

**Objectives:**

- Clean route organization
- Dependency injection at route level

**Tasks:**

```
✓ Create presentation/http/routes/seasonRoutes.ts
  - Express Router setup
  - Controller injection
  - Route definitions with clear verbs
  - GET /seasons → getAll()
  - GET /seasons/:id → getById()
  - POST /seasons → create()
  - PUT /seasons/:id → update()
  - DELETE /seasons/:id → delete()

✓ Create presentation/http/routes/raceRoutes.ts
✓ Create presentation/http/routes/racerRoutes.ts
✓ Create presentation/http/routes/leaderboardRoutes.ts
```

#### 4.3 Express App Setup

**Objectives:**

- Separate Express configuration from business logic
- Clean dependency injection

**Tasks:**

```
✓ Create presentation/http/express-app.ts
  - App factory function
  - Middleware setup
  - Route registration
  - Error handling middleware
  - CORS, body parser, session, etc.

✓ Update index.ts
  - Call app factory
  - Initialize DI container
  - Start server
```

**Deliverable:**

- All controllers refactored
- Clean routes
- HTTP concerns isolated

---

### Phase 5: Cross-Cutting Concerns (Week 1)

#### 5.1 Error Handling

**Objectives:**

- Centralized error handling
- Consistent error responses

**Tasks:**

```
✓ Create shared/Result.ts
  - Success<T> and Failure types
  - Try/catch helper methods
  - Enable functional error handling

✓ Create presentation/http/middleware/errorHandler.ts
  - Express error middleware
  - Map domain errors to HTTP status
  - Log errors
  - Return consistent ErrorResponse DTO

✓ Create shared/utils/ErrorMapper.ts
  - DomainError → HttpError
  - DomainError → ErrorResponse DTO
  - Status code mapping

Error Mapping Examples:
- RacerNotFoundError → 404 Not Found
- InvalidPointsError → 400 Bad Request
- DuplicateRacerError → 409 Conflict
```

#### 5.2 Logging

**Objectives:**

- Structured logging
- Performance monitoring

**Tasks:**

```
✓ Create shared/utils/logger.ts
  - Structured logging interface
  - Methods: info, warn, error, debug
  - Include timestamp, context

✓ Create presentation/http/middleware/requestLogger.ts
  - Log incoming requests
  - Log response status
  - Include request ID for tracing

✓ Add logging to use cases
  - Info: use case execution started/completed
  - Error: exceptions with context
  - Debug: intermediate values
```

#### 5.3 Validation Middleware

**Objectives:**

- Request validation before controllers
- Consistent error responses

**Tasks:**

```
✓ Create presentation/http/middleware/validationMiddleware.ts
  - Generic middleware factory
  - Usage: validationMiddleware(CreateSeasonValidator)
  - Validates request body against validator
  - Returns 400 with validation errors on fail

✓ Apply to all routes
  - POST /seasons → validationMiddleware(CreateSeasonValidator)
  - PUT /seasons/:id → validationMiddleware(UpdateSeasonValidator)
```

**Deliverable:**

- Centralized error handling
- Structured logging
- Request validation
- Consistent responses

---

### Phase 6: Testing & DI Container Update (Week 1)

#### 6.1 Update Dependency Injection

**Objectives:**

- Register all new classes
- Simplify container usage

**Tasks:**

```
✓ Refactor di/Container.ts
  - Register all use cases
  - Register all repositories
  - Register all services
  - Register all validators
  - Maintain ServiceLocator pattern

✓ Update container method examples:
  Container.registerUseCase('GetAllSeasons', getAllSeasonsUseCase)
  Container.registerRepository('Season', seasonRepository)
  Container.createSeasonController(): returns fully injected controller
```

#### 6.2 Unit Testing

**Objectives:**

- Test domain logic
- Mock infrastructure

**Tasks:**

```
✓ Create tests/unit/domain/entities/
  - SeasonTest.ts
  - RaceTest.ts
  - RacerTest.ts
  - RaceResultTest.ts

✓ Create tests/unit/domain/policies/
  - PointsAllocationPolicyTest.ts
  - LeaderboardCalculationPolicyTest.ts

✓ Create tests/unit/application/use-cases/
  - GetAllSeasonsUseCaseTest.ts
  - CreateSeasonUseCaseTest.ts
  - GetLeaderboardUseCaseTest.ts
  - [One per use case]

✓ Create tests/unit/application/validators/
  - CreateSeasonValidatorTest.ts
  - CreateRacerValidatorTest.ts

✓ Setup Jest configuration
  - tsconfig for tests
  - Test reporter
```

#### 6.3 Integration Testing

**Objectives:**

- Test repositories with real storage
- Test use cases with injected mocks

**Tasks:**

```
✓ Create tests/integration/repositories/
  - SeasonRepositoryTest.ts (with JsonStorageAdapter)
  - Test CRUD operations
  - Test mapping

✓ Create tests/integration/use-cases/
  - GetLeaderboardUseCaseTest.ts
  - End-to-end through all layers
```

#### 6.4 E2E Testing

**Objectives:**

- Test HTTP API end-to-end
- Validate full flow

**Tasks:**

```
✓ Create tests/e2e/api/
  - seasonApi.test.ts
  - raceApi.test.ts
  - racerApi.test.ts
  - leaderboardApi.test.ts
  - auth.test.ts

✓ Setup test database/fixtures
```

**Deliverable:**

- 80%+ code coverage
- Unit tests for domain logic
- Integration tests for repositories
- E2E tests for API

---

### Phase 7: Documentation & Optimization (Ongoing)

#### 7.1 Architecture Documentation

**Tasks:**

```
✓ Create src/ARCHITECTURE.md
  - Overview of layers
  - Dependency flow diagram
  - Adding new features guide
  - Design decisions and rationale

✓ Create src/API_CONTRACTS.md
  - Endpoint documentation
  - Request/response examples
  - Error codes and meanings

✓ Create src/DOMAIN_MODEL.md
  - Entity definitions
  - Business rules
  - Value objects
  - Policies

✓ Create DEVELOPMENT.md
  - Setup instructions
  - Running tests
  - Adding new features
  - Debugging
```

#### 7.2 Code Organization Checklist

- [ ] No Express imports in domain layer
- [ ] No Storage imports in domain/application
- [ ] All repositories use interfaces
- [ ] All errors extend DomainError
- [ ] Controllers only handle HTTP
- [ ] Use cases orchestrate business logic
- [ ] Entities contain invariants
- [ ] Clear separation of concerns

---

## Implementation Guidelines

### 1. Dependency Injection Best Practices

```typescript
// ✅ GOOD: Inject dependencies
constructor(
  private racerRepository: RacerRepository,
  private leaderboardService: LeaderboardService
) {}

// ❌ BAD: Create dependencies
constructor() {
  this.racerRepository = new RacerRepositoryImpl(...);
}
```

### 2. Error Handling Pattern

```typescript
// ✅ GOOD: Domain error thrown
if (!racer) {
  throw new RacerNotFoundError(racerId);
}

// ❌ BAD: Generic error
if (!racer) {
  throw new Error("Racer not found");
}
```

### 3. Use Case Template

```typescript
export class GetSeasonByIdUseCase implements UseCase<GetSeasonByIdRequest, SeasonResponse> {
  constructor(private seasonRepository: SeasonRepository) {}

  async execute(request: GetSeasonByIdRequest): Promise<SeasonResponse> {
    // 1. Validate input
    const validator = new GetSeasonByIdValidator();
    const validation = validator.validate(request);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // 2. Execute business logic
    const season = await this.seasonRepository.findById(request.id);
    if (!season) {
      throw new SeasonNotFoundError(request.id);
    }

    // 3. Return DTO
    return this.seasonMapper.toDTO(season);
  }
}
```

### 4. Controller Template

```typescript
export class SeasonController {
  constructor(
    private getSeasonUseCase: GetSeasonByIdUseCase,
    private getAllSeasonsUseCase: GetAllSeasonsUseCase,
  ) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.getSeasonUseCase.execute({
        id: req.params.id,
      });
      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }
}
```

### 5. Entity Template

```typescript
export class Racer {
  private constructor(
    public readonly id: RacerId,
    public readonly name: string,
    public readonly email: string,
    public readonly joinDate: Date,
    private status: "active" | "inactive",
  ) {}

  static create(data: RacerCreateData): Result<Racer> {
    // Validate invariants
    if (!data.name || data.name.length < 2) {
      return Result.fail("Name must be at least 2 characters");
    }

    return Result.ok(new Racer(RacerId.create(), data.name, data.email, new Date(), "active"));
  }

  activate(): void {
    this.status = "active";
  }

  deactivate(): void {
    this.status = "inactive";
  }

  isActive(): boolean {
    return this.status === "active";
  }
}
```

---

## Testing Strategy

### Test Pyramid

```
         E2E Tests (10%)
      /         \
    Integration  \
    Tests (20%)   \
  /               \
Unit Tests (70%)
```

### Testing Approach by Layer

| Layer              | Test Type          | Focus                                 | Mock             | Tools            |
| ------------------ | ------------------ | ------------------------------------- | ---------------- | ---------------- |
| **Domain**         | Unit               | Entity logic, policies, value objects | None             | Jest             |
| **Application**    | Unit + Integration | Use case orchestration, validators    | Repository mocks | Jest             |
| **Infrastructure** | Integration        | Repository CRUD, mappers              | Storage adapter  | Jest + fixtures  |
| **Presentation**   | E2E + Integration  | Controller routing, HTTP              | Database mock    | Jest + Supertest |

### Test Examples

```typescript
// Domain unit test
describe('Racer', () => {
  it('should create inactive racer', () => {
    const racer = Racer.create({ name: 'John', email: 'j@x' });
    expect(racer.isActive()).toBe(true);
  });

  it('should deactivate racer', () => {
    const racer = Racer.create({ ... }).value;
    racer.deactivate();
    expect(racer.isActive()).toBe(false);
  });
});

// Use case unit test
describe('GetLeaderboardUseCase', () => {
  it('should return leaderboard sorted by points', async () => {
    const mockRaceRepository = { ... };
    const mockRaceResultRepository = { ... };
    const useCase = new GetLeaderboardUseCase(
      mockRaceRepository,
      mockRaceResultRepository
    );

    const response = await useCase.execute({ seasonId: '123' });

    expect(response.entries[0].points).toBeGreaterThanOrEqual(
      response.entries[1].points
    );
  });
});

// Integration test
describe('SeasonRepository', () => {
  it('should persist and retrieve season', async () => {
    const storage = new JsonStorageAdapter('./test-data');
    const repository = new SeasonRepositoryImpl(storage);

    const created = await repository.create({
      name: 'Season 1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    });

    const retrieved = await repository.findById(created.id.value);
    expect(retrieved?.name).toBe('Season 1');
  });
});

// E2E test
describe('GET /api/seasons/:id', () => {
  it('should return season details', async () => {
    const response = await request(app)
      .get('/api/seasons/123')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name');
  });
});
```

---

## Success Metrics

### Code Quality Metrics

| Metric                | Target              | Current    |
| --------------------- | ------------------- | ---------- |
| Test Coverage         | 80%+                | 0%         |
| Domain Logic Tests    | 100%                | 0%         |
| Cyclomatic Complexity | < 5 per method      | > 10       |
| Dependency Layers     | 5 (one-directional) | 3          |
| Framework Coupling    | Only Presentation   | All layers |

### Architecture Metrics

| Aspect              | Measurement                                                 |
| ------------------- | ----------------------------------------------------------- |
| **Testability**     | Can test domain logic without Express/Storage               |
| **Maintainability** | New feature = 1 new use case, 1 controller method           |
| **Scalability**     | Add new entity → new domain class + repo interface          |
| **Reusability**     | Use cases callable from multiple contexts (HTTP, CLI, etc.) |

### Performance Metrics

| Metric                   | Target                 |
| ------------------------ | ---------------------- |
| API Response Time (GET)  | < 100ms                |
| API Response Time (POST) | < 200ms                |
| Leaderboard Calculation  | < 500ms for 100 racers |
| Memory Usage             | < 150MB                |

---

## Risk Mitigation

### Risks & Mitigation

| Risk                          | Probability | Impact | Mitigation                          |
| ----------------------------- | ----------- | ------ | ----------------------------------- |
| Breaking changes to API       | High        | High   | Feature flags, API versioning       |
| Performance degradation       | Medium      | High   | Benchmark before/after, caching     |
| Database migration complexity | Low         | Medium | Keep JSON adapter during transition |
| Team coordination             | Medium      | Medium | Clear phase gates, code reviews     |
| Over-engineering              | High        | Medium | Simplicity-first approach, YAGNI    |

---

## Next Steps

1. **Week 1 Start**: Create domain entities and value objects
2. **Week 1 Review**: Domain layer review and refinement
3. **Week 2 Start**: Implement use cases and DTOs
4. **Week 2 Review**: Application layer walkthrough
5. **Week 3 Start**: Infrastructure and Presentation layers
6. **Week 4 Start**: Testing and integration
7. **Week 5**: Polish, documentation, deployment

---

## Success Definition

Clean architecture transition is **successful** when:

✅ Domain logic can be tested without Express or database  
✅ Adding new feature takes ≤ 2 hours (with tests)  
✅ 80%+ test coverage with meaningful tests  
✅ No framework imports in domain/application layers  
✅ All errors are domain-specific and descriptive  
✅ New developer can understand architecture in < 2 hours  
✅ API response times unchanged or improved  
✅ Zero breaking changes to API contracts

---

## References & Resources

- **Clean Architecture**: Robert C. Martin - "Clean Architecture: A Craftsman's Guide to Software Structure and Design"
- **DDD**: Eric Evans - "Domain-Driven Design"
- **SOLID Principles**: Robert C. Martin articles
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
