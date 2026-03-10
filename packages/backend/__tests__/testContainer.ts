import { Container } from "../src/Infrastructure/dependency-injection/container";
import { StorageAdapter } from "../src/Infrastructure/persistence/StorageAdapter";
import { InMemoryStorageAdapter } from "./helpers/inMemoryStorageAdapter";

export interface CreateTestContainerOptions {
  storageAdapter?: StorageAdapter;
}

export function createTestContainer(options: CreateTestContainerOptions = {}): Container {
  return Container.create({
    storageAdapter: options.storageAdapter ?? new InMemoryStorageAdapter(),
  });
}

export { InMemoryStorageAdapter } from "./helpers/inMemoryStorageAdapter";