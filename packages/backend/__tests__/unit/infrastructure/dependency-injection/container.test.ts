import { users } from "../../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../../testContainer";
import { Container } from "../../../../src/Infrastructure/dependency-injection/container";

describe("Container", () => {
  // 1. Given an injected in-memory adapter, when resolving services and controllers, then the container wires the real backend graph against that adapter.
  // 2. Given a custom container instance, when setting it as the singleton, then runtime lookups resolve to the injected test container.

  afterEach(() => {
    Container.resetInstance();
  });

  it("uses an injected storage adapter for real service resolution", async () => {
    const storageAdapter = new InMemoryStorageAdapter();
    const seededUser = users.admin();

    storageAdapter.seed("users", [{ ...seededUser }]);

    const container = createTestContainer({ storageAdapter });
    const authService = container.getAuthService();
    const allUsers = await authService.getAllUsers();

    expect(container.getStorageAdapter()).toBe(storageAdapter);
    expect(container.createAdminController()).toBeDefined();
    expect(allUsers).toEqual([
      expect.objectContaining({
        id: seededUser.id,
        email: seededUser.email,
        role: seededUser.role,
      }),
    ]);
  });

  it("allows overriding the singleton instance for integration-style tests", () => {
    const container = createTestContainer();

    Container.setInstance(container);

    expect(Container.getInstance()).toBe(container);
  });
});
