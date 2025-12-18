# Storage Adapter Architecture

## Overview

The Storage Adapter pattern provides an abstraction layer for data persistence, allowing the application to work with different storage backends without changing business logic. This enables seamless migration from JSON files (development) to a database ORM (production).

## Architecture

```
┌─────────────────────────────────────┐
│   Application / Services / Routes   │
└──────────────┬──────────────────────┘
               │
               │ uses
               ↓
┌─────────────────────────────────────┐
│      StorageAdapter Interface       │
│  (Platform-agnostic contract)       │
└──────────────┬──────────────────────┘
               │
               │ implemented by
       ┌───────┴───────┬──────────────────┐
       ↓               ↓                  ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   JSON       │ │   Prisma     │ │   MongoDB    │
│   Adapter    │ │   Adapter    │ │   Adapter    │
└──────────────┘ └──────────────┘ └──────────────┘
       ↓               ↓                  ↓
  JSON Files      PostgreSQL          MongoDB
```

## Benefits

1. **Flexibility**: Switch between storage backends with minimal code changes
2. **Testability**: Easy to mock storage for unit testing
3. **Development**: Start with JSON files, migrate to database later
4. **Decoupling**: Business logic is independent of storage implementation

## Interface

### StorageAdapter

All storage implementations must implement the following methods:

```typescript
interface StorageAdapter {
  findById<T>(collection: string, id: string): Promise<T | null>;
  findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]>;
  create<T>(collection: string, data: Omit<T, "id">): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;
  exists(collection: string, id: string): Promise<boolean>;
  count(collection: string, filter?: Record<string, unknown>): Promise<number>;
}
```

## Current Implementation: JSON Storage

### Features

- **File-based persistence**: Each collection is stored in a separate JSON file
- **Automatic ID generation**: Uses UUID v4 for record IDs
- **In-memory filtering**: Supports basic key-value filtering
- **Auto-initialization**: Creates data directory on first use
- **Development-friendly**: No external dependencies, perfect for prototyping

### Usage

```typescript
import { JsonStorageAdapter } from "./storage";

const storage = new JsonStorageAdapter("./data");
await storage.initialize();

// Create
const racer = await storage.create("racers", {
  name: "John Doe",
  email: "john@example.com",
});

// Read
const foundRacer = await storage.findById("racers", racer.id);
const allRacers = await storage.findAll("racers");
const activeRacers = await storage.findAll("racers", { active: true });

// Update
const updated = await storage.update("racers", racer.id, {
  name: "Jane Doe",
});

// Delete
await storage.delete("racers", racer.id);

// Check existence
const exists = await storage.exists("racers", racer.id);

// Count
const count = await storage.count("racers");
```

### File Structure

```
data/
├── racers.json
├── races.json
├── seasons.json
└── users.json
```

Example `racers.json`:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "team": "Muckleren",
    "active": true
  }
]
```

## Future Implementations

### Prisma Adapter

```typescript
export class PrismaStorageAdapter implements StorageAdapter {
  constructor(private prismaClient: PrismaClient) {}

  // Implement interface using Prisma client methods
}
```

**Advantages**:

- Type-safe database queries
- Support for PostgreSQL, MySQL, SQLite, etc.
- Built-in migrations
- Relationship management

### MongoDB Adapter

```typescript
export class MongoStorageAdapter implements StorageAdapter {
  constructor(private mongoClient: MongoClient) {}

  // Implement interface using MongoDB operations
}
```

**Advantages**:

- NoSQL flexibility
- Horizontal scalability
- Document-based querying

## Migration Path

1. **Phase 1**: JSON files (current) - Development & testing
2. **Phase 2**: Integrate Prisma with PostgreSQL
   - Keep JsonStorageAdapter for tests
   - Use PrismaStorageAdapter in production
3. **Phase 3**: Optional - Switch to MongoDB if needed

### Migration Steps

1. Create `PrismaStorageAdapter` implementing `StorageAdapter`
2. Update service layer to accept adapter as dependency (dependency injection)
3. Update initialization code to use appropriate adapter based on environment
4. Run migrations to populate database
5. Deploy with Prisma adapter

## Dependency Injection Pattern

### Recommended Setup

```typescript
// In your main app file or DI container
const storage: StorageAdapter =
  process.env.NODE_ENV === "production"
    ? new PrismaStorageAdapter(prismaClient)
    : new JsonStorageAdapter("./data");

// Pass to services
const racerService = new RacerService(storage);
const raceService = new RaceService(storage);
```

## Error Handling

All adapter methods should throw descriptive errors:

```typescript
- Record not found: "Record with id {id} not found in collection {collection}"
- Invalid operations: Descriptive error messages
- File I/O errors: Handled gracefully with meaningful context
```

## Testing

Mock the StorageAdapter for unit tests:

```typescript
class MockStorageAdapter implements StorageAdapter {
  // Implement with in-memory storage for testing
}

const storage = new MockStorageAdapter();
const service = new RacerService(storage);
// Test service logic without file I/O
```

## Performance Considerations

### JSON Adapter

- **Suitable for**: < 10K records per collection
- **Limitation**: All data loaded into memory for filtering
- **Optimization**: Filter early, limit result sets

### Database Adapters

- **Advantage**: Efficient querying with indexes
- **Scaling**: Handle millions of records
- **Network**: Some latency vs file I/O

## Next Steps

1. Integrate storage adapter into service layer
2. Create repository pattern on top of adapter
3. Add validation layer
4. Implement caching if needed
5. Plan migration to database when ready
