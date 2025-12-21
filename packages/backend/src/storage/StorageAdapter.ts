/**
 * Storage Adapter Interface
 *
 * Defines a contract for data persistence that can be implemented by
 * different storage backends (JSON, Database ORM, etc.)
 */

export interface StorageAdapter {
  findById<T>(collection: string, id: string): Promise<T | null>;
  findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]>;
  create<T>(collection: string, data: Omit<T, "id">): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;
  exists(collection: string, id: string): Promise<boolean>;
  count(collection: string, filter?: Record<string, unknown>): Promise<number>;
}
