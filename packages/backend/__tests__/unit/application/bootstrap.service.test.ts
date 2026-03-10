import bcrypt from "bcrypt";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";

interface PersistedBootstrapConfigRecord extends Record<string, unknown> {
  id: string;
  bootstrapTokenHash: string;
  bootstrapTokenExpiresAt: Date;
  isInitialized: boolean;
}

interface PersistedUserRecord extends Record<string, unknown> {
  id: string;
  googleId: string;
  email: string;
  name: string;
  role: string;
}

describe("BootstrapService", () => {
  // 1. Given no bootstrap config, when checking initialization state, then the service reports that the system is not bootstrapped.
  // 2. Given an uninitialized system, when generating a bootstrap token, then the service returns the plain token and persists only its hash with the configured expiration.
  // 3. Given an initialized system, when generating a bootstrap token, then the service throws an already bootstrapped error.
  // 4. Given bootstrap setup preconditions are invalid, when creating the bootstrap admin, then the service throws for missing config, initialized config, expired token, and invalid token.
  // 5. Given a valid bootstrap token, when bootstrapping the system, then the service creates an admin user and marks the system initialized.

  let container: Container;
  let storageAdapter: InMemoryStorageAdapter;

  beforeEach(() => {
    container = createTestContainer();
    storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;
  });

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  it("reports the system as not bootstrapped when no config exists", async () => {
    const bootstrapService = container.getBootstrapService();

    await expect(bootstrapService.isSystemBootstrapped()).resolves.toBe(false);
  });

  it("generates a bootstrap token and persists only its hash", async () => {
    const bootstrapService = container.getBootstrapService();

    const beforeGeneration = Date.now();
    const result = await bootstrapService.generateBootstrapToken({ expirationMinutes: 15 });
    const persistedConfigs = storageAdapter.snapshot<PersistedBootstrapConfigRecord>(
      "bootstrapConfig",
    );

    expect(result.bootstrapToken).toMatch(/^[a-f0-9]{64}$/);
    expect(result.expiresAt.getTime()).toBeGreaterThan(beforeGeneration);
    expect(persistedConfigs).toHaveLength(1);
    expect(persistedConfigs[0]).toEqual(
      expect.objectContaining({
        id: "singleton",
        isInitialized: false,
      }),
    );
    expect(persistedConfigs[0].bootstrapTokenHash).not.toBe(result.bootstrapToken);
    expect(bcrypt.compareSync(result.bootstrapToken, persistedConfigs[0].bootstrapTokenHash)).toBe(
      true,
    );
    expect(persistedConfigs[0].bootstrapTokenExpiresAt).toEqual(result.expiresAt);
  });

  it("throws when generating a bootstrap token for an initialized system", async () => {
    storageAdapter.seed("bootstrapConfig", [
      {
        id: "singleton",
        bootstrapTokenHash: bcrypt.hashSync("already-used", 10),
        bootstrapTokenExpiresAt: new Date("2026-06-01T00:00:00.000Z"),
        isInitialized: true,
      },
    ]);

    const bootstrapService = container.getBootstrapService();

    await expect(bootstrapService.generateBootstrapToken()).rejects.toThrow(
      "System is already bootstrapped",
    );
  });

  it("throws for invalid bootstrap setup preconditions", async () => {
    const bootstrapService = container.getBootstrapService();

    await expect(
      bootstrapService.bootstrapSystem({
        token: "missing",
        googleId: "google-admin-1",
        email: "admin@test.com",
        name: "Admin User",
      }),
    ).rejects.toThrow("Bootstrap configuration not found");

    storageAdapter.seed("bootstrapConfig", [
      {
        id: "singleton",
        bootstrapTokenHash: bcrypt.hashSync("expired-token", 10),
        bootstrapTokenExpiresAt: new Date("2020-01-01T00:00:00.000Z"),
        isInitialized: false,
      },
    ]);

    await expect(
      bootstrapService.bootstrapSystem({
        token: "expired-token",
        googleId: "google-admin-2",
        email: "expired@test.com",
        name: "Expired Admin",
      }),
    ).rejects.toThrow("Bootstrap token has expired");

    storageAdapter.seed("bootstrapConfig", [
      {
        id: "singleton",
        bootstrapTokenHash: bcrypt.hashSync("valid-token", 10),
        bootstrapTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
        isInitialized: false,
      },
    ]);

    await expect(
      bootstrapService.bootstrapSystem({
        token: "wrong-token",
        googleId: "google-admin-3",
        email: "invalid@test.com",
        name: "Invalid Admin",
      }),
    ).rejects.toThrow("Invalid bootstrap token");

    storageAdapter.seed("bootstrapConfig", [
      {
        id: "singleton",
        bootstrapTokenHash: bcrypt.hashSync("used-token", 10),
        bootstrapTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
        isInitialized: true,
      },
    ]);

    await expect(
      bootstrapService.bootstrapSystem({
        token: "used-token",
        googleId: "google-admin-4",
        email: "used@test.com",
        name: "Used Admin",
      }),
    ).rejects.toThrow("System is already bootstrapped");
  });

  it("creates the bootstrap admin user and marks the system initialized", async () => {
    const bootstrapService = container.getBootstrapService();
    const generatedToken = await bootstrapService.generateBootstrapToken({ expirationMinutes: 30 });

    const createdAdmin = await bootstrapService.bootstrapSystem({
      token: generatedToken.bootstrapToken,
      googleId: "google-admin-success",
      email: "bootstrap.admin@test.com",
      name: "Bootstrap Admin",
    });

    const persistedUsers = storageAdapter.snapshot<PersistedUserRecord>("users");
    const persistedConfigs = storageAdapter.snapshot<PersistedBootstrapConfigRecord>(
      "bootstrapConfig",
    );

    expect(createdAdmin).toEqual(
      expect.objectContaining({
        email: "bootstrap.admin@test.com",
        name: "Bootstrap Admin",
        role: "admin",
      }),
    );
    expect(createdAdmin.id).toBeTruthy();
    expect(persistedUsers).toHaveLength(1);
    expect(persistedUsers[0]).toEqual(
      expect.objectContaining({
        email: "bootstrap.admin@test.com",
        googleId: "google-admin-success",
        role: "admin",
      }),
    );
    expect(persistedConfigs).toHaveLength(1);
    expect(persistedConfigs[0]).toEqual(
      expect.objectContaining({
        id: "singleton",
        isInitialized: true,
      }),
    );
    await expect(bootstrapService.isSystemBootstrapped()).resolves.toBe(true);
  });
});