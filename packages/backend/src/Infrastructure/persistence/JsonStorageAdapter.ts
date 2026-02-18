import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { StorageAdapter } from "./StorageAdapter";

/**
 * JSON File-based Storage Adapter
 *
 * Implements StorageAdapter using JSON files for persistence.
 * Each collection is stored in a separate JSON file.
 * Useful for development and testing before database setup.
 */
export class JsonStorageAdapter implements StorageAdapter {
  private dataDir: string;

  constructor(dataDir: string = "./data") {
    this.dataDir = dataDir;
  }

  /**
   * Initialize storage directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error("Failed to initialize storage directory:", error);
      throw error;
    }
  }

  /**
   * Get the file path for a collection
   */
  private getCollectionPath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Load collection data from file
   */
  private async loadCollection<T>(collection: string): Promise<T[]> {
    const filePath = this.getCollectionPath(collection);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, return empty array
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  /**
   * Save collection data to file
   */
  private async saveCollection<T>(collection: string, data: T[]): Promise<void> {
    const filePath = this.getCollectionPath(collection);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const records = await this.loadCollection<T>(collection);
    return records.find((record) => (record as Record<string, unknown>).id === id) || null;
  }

  async findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]> {
    const records = await this.loadCollection<T>(collection);

    if (!filter) {
      return records;
    }

    return records.filter((record) => {
      return Object.entries(filter).every(([key, value]) => {
        return (record as Record<string, unknown>)[key] === value;
      });
    });
  }

  async create<T>(collection: string, data: Omit<T, "id">): Promise<T> {
    const records = await this.loadCollection<T>(collection);
    const newRecord = {
      ...data,
      id: (data as any).id || this.generateId(),
    } as T;
    records.push(newRecord);
    await this.saveCollection(collection, records);
    return newRecord;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const records = await this.loadCollection<T>(collection);
    const index = records.findIndex((record) => (record as Record<string, unknown>).id === id);

    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }

    const updatedRecord = { ...records[index], ...data } as T;
    records[index] = updatedRecord;
    await this.saveCollection(collection, records);
    return updatedRecord;
  }

  async delete(collection: string, id: string): Promise<void> {
    const records = await this.loadCollection(collection);
    const filtered = records.filter((record) => (record as Record<string, unknown>).id !== id);

    if (filtered.length === records.length) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }

    await this.saveCollection(collection, filtered);
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const record = await this.findById(collection, id);
    return record !== null;
  }

  async count(collection: string, filter?: Record<string, unknown>): Promise<number> {
    const records = await this.findAll(collection, filter);
    return records.length;
  }
}
