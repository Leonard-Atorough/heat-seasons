import { StorageAdapter } from "../../src/Infrastructure/persistence/StorageAdapter";

export function CreateMockStorageAdapter(
  overrides?: Partial<StorageAdapter>,
): jest.Mocked<StorageAdapter> {
  return {
    initialize: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as jest.Mocked<StorageAdapter>;
}

export function CreateInMemoryStorageAdapter(): jest.Mocked<StorageAdapter> {
  const dataStore: Record<string, any[]> = {};

  return {
    initialize: jest.fn(() => Promise.resolve()),
    findAll: jest.fn((collection: string, filters?: Record<string, unknown>) => {
      const items = dataStore[collection] || [];

      if (!filters) {
        return Promise.resolve(items);
      }
      return Promise.resolve(
        items.filter((item) => {
          return Object.entries(filters).every(([key, value]) => item[key] === value);
        }),
      );
    }),
    findById: jest.fn((collection: string, id: string) => {
      const items = dataStore[collection] || [];
      const item = items.find((item) => item.id === id);
      return Promise.resolve(item || null);
    }),
    create: jest.fn((collection: string, data: any) => {
      const newItem = { ...data, id: `id-${Date.now()}` };
      if (!dataStore[collection]) {
        dataStore[collection] = [];
      }
      dataStore[collection].push(newItem);
      return Promise.resolve(newItem);
    }),
    update: jest.fn((collection: string, id: string, data: any) => {
      const items = dataStore[collection] || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return Promise.reject(new Error("Item not found"));
      }
      items[index] = { ...items[index], ...data };
      return Promise.resolve(items[index]);
    }),
    delete: jest.fn((collection: string, id: string) => {
      const items = dataStore[collection] || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return Promise.reject(new Error("Item not found"));
      }
      items.splice(index, 1);
      return Promise.resolve();
    }),
    exists: jest.fn((collection: string, id: string) => {
      const items = dataStore[collection] || [];
      const exists = items.some((item) => item.id === id);
      return Promise.resolve(exists);
    }),
    count: jest.fn((collection: string, filters?: Record<string, unknown>) => {
      const items = dataStore[collection] || [];
      if (!filters) {
        return Promise.resolve(items.length);
      }
      const count = items.filter((item) => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      }).length;
      return Promise.resolve(count);
    }),
  };
}
