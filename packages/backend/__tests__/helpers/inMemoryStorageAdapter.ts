import { randomUUID } from "crypto";
import { StorageAdapter } from "../../src/Infrastructure/persistence/StorageAdapter";

/**
 * A CollectionRecord represents a generic record in a collection, with string keys and unknown values. This allows the InMemoryStorageAdapter to store any type of data without needing specific interfaces for each collection.
 */
type CollectionRecord = Record<string, unknown>;

export class InMemoryStorageAdapter implements StorageAdapter {
  private collections = new Map<string, CollectionRecord[]>();

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  reset(): void {
    this.collections.clear();
  }

  seed<T extends CollectionRecord>(collection: string, records: T[]): void {
    this.collections.set(
      collection,
      records.map((record) => this.cloneRecord(record)),
    );
  }

  snapshot<T extends CollectionRecord>(collection: string): T[] {
    return this.readCollection<T>(collection);
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const record = this.getMutableCollection(collection).find((item) => item.id === id);
    return record ? (this.cloneRecord(record as CollectionRecord) as T) : null;
  }

  async findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]> {
    const records = this.getMutableCollection(collection);
    const filtered = filter
      ? records.filter((record) => this.matchesFilter(record, filter))
      : records;
    return filtered.map((record) => this.cloneRecord(record as CollectionRecord) as T);
  }

  async create<T>(collection: string, data: Omit<T, "id">): Promise<T> {
    const records = this.getMutableCollection(collection);
    const now = new Date();
    const mutableData = data as Record<string, unknown>;
    const recordId = this.resolveRecordId(collection, mutableData);
    const record = this.cloneRecord({
      ...mutableData,
      id: recordId,
      createdAt: mutableData.createdAt ?? now,
      updatedAt: mutableData.updatedAt ?? now,
    });

    records.push(record);
    return this.cloneRecord(record) as T;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const records = this.getMutableCollection(collection);
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }

    const currentRecord = records[index];
    const updatedRecord = this.cloneRecord({
      ...currentRecord,
      ...(data as Record<string, unknown>),
      id,
      updatedAt: new Date(),
    });

    records[index] = updatedRecord;
    return this.cloneRecord(updatedRecord) as T;
  }

  async delete(collection: string, id: string): Promise<void> {
    const records = this.getMutableCollection(collection);
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${collection}`);
    }

    records.splice(index, 1);
  }

  async exists(collection: string, id: string): Promise<boolean> {
    return this.getMutableCollection(collection).some((record) => record.id === id);
  }

  async count(collection: string, filter?: Record<string, unknown>): Promise<number> {
    const records = await this.findAll(collection, filter);
    return records.length;
  }

  private getMutableCollection(collection: string): CollectionRecord[] {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, []);
    }

    return this.collections.get(collection)!;
  }

  private readCollection<T extends CollectionRecord>(collection: string): T[] {
    return this.getMutableCollection(collection).map((record) => this.cloneRecord(record) as T);
  }

  private matchesFilter(record: CollectionRecord, filter: Record<string, unknown>): boolean {
    return Object.entries(filter).every(([key, value]) => {
      return record[key] === value;
    });
  }

  private resolveRecordId(collection: string, record: Record<string, unknown>): string {
    if (typeof record.id === "string") {
      return record.id;
    }

    if (
      collection === "seasonParticipants" &&
      typeof record.seasonId === "string" &&
      typeof record.racerId === "string"
    ) {
      return `${record.seasonId}:${record.racerId}`;
    }

    return randomUUID();
  }

  private cloneRecord<T extends CollectionRecord>(record: T): T {
    return this.cloneValue(record) as T;
  }

  private cloneValue<T>(value: T): T {
    if (value instanceof Date) {
      return new Date(value.getTime()) as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.cloneValue(item)) as T;
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
          key,
          this.cloneValue(entryValue),
        ]),
      ) as T;
    }

    return value;
  }
}
