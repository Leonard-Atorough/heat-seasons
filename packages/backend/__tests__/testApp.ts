import { createApp, CreateAppOptions } from "../src/app";
import { createTestContainer } from "./testContainer";

export function createTestApp(options?: CreateAppOptions) {
  return createApp({
    controllerFactory: options?.controllerFactory ?? createTestContainer(),
    controllers: options?.controllers,
  });
}

export { InMemoryStorageAdapter } from "./helpers/inMemoryStorageAdapter";
