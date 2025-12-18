/**
 * Storage Adapter Interface
 *
 * Defines a contract for data persistence that can be implemented by
 * different storage backends (JSON, Database ORM, etc.)
 */

export interface StorageAdapter {
  /**
   * Find a single record by ID
   */
  findById<T>(collection: string, id: string): Promise<T | null>;

  /**
   * Find all records in a collection with optional filtering
   */
  findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]>;

  /**
   * Create a new record
   */
  create<T>(collection: string, data: Omit<T, "id">): Promise<T>;

  /**
   * Update an existing record
   */
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record by ID
   */
  delete(collection: string, id: string): Promise<void>;

  /**
   * Check if a record exists
   */
  exists(collection: string, id: string): Promise<boolean>;

  /**
   * Count records in a collection
   */
  count(collection: string, filter?: Record<string, unknown>): Promise<number>;
}
