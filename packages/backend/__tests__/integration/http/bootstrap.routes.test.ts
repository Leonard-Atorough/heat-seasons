import bcrypt from "bcrypt";
import request from "supertest";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { User } from "shared";

interface PersistedBootstrapConfigRecord extends Record<string, unknown> {
  id: string;
  bootstrapTokenHash: string;
  bootstrapTokenExpiresAt: Date;
  isInitialized: boolean;
}

type PersistedUserRecord = User & Record<string, unknown>;

describe("Bootstrap routes integration", () => {
  // 1. Given no bootstrap config, when requesting GET /api/bootstrap/status, then the route reports that the system is not bootstrapped.
  // 2. Given an initialized bootstrap config, when requesting GET /api/bootstrap/status, then the route reports that the system is bootstrapped.
  // 3. Given an uninitialized system, when requesting POST /api/bootstrap/token, then the route returns a plain token and persists only its hash.
  // 4. Given an initialized system, when requesting POST /api/bootstrap/token, then the route returns the shared 500 error envelope from the error middleware.
  // 5. Given a valid bootstrap token, when requesting POST /api/bootstrap/admin, then the route creates the admin user and marks the system initialized.
  // 6. Given an invalid bootstrap token, when requesting POST /api/bootstrap/admin, then the route returns the shared 500 error envelope and leaves persisted state unchanged.

  function seedBootstrapConfig(
    storageAdapter: InMemoryStorageAdapter,
    records: PersistedBootstrapConfigRecord[],
  ): void {
    storageAdapter.seed<PersistedBootstrapConfigRecord>("bootstrapConfig", records);
  }

  function snapshotBootstrapConfig(
    storageAdapter: InMemoryStorageAdapter,
  ): PersistedBootstrapConfigRecord[] {
    return storageAdapter.snapshot<PersistedBootstrapConfigRecord>("bootstrapConfig");
  }

  function snapshotUsers(storageAdapter: InMemoryStorageAdapter): User[] {
    return storageAdapter.snapshot<PersistedUserRecord>("users");
  }

  function setupBootstrapApp(options: { bootstrapConfig?: PersistedBootstrapConfigRecord[] } = {}) {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;

    seedBootstrapConfig(storageAdapter, options.bootstrapConfig ?? []);
    Container.setInstance(container);

    return {
      app: createTestApp({ controllerFactory: container }),
      storageAdapter,
    };
  }

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  it("reports the system as not bootstrapped when no config exists", async () => {
    const { app } = setupBootstrapApp();

    const response = await request(app).get("/api/bootstrap/status");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: expect.any(String),
        data: { isBootstrapped: false },
      }),
    );
  });

  it("reports the system as bootstrapped when the bootstrap config is initialized", async () => {
    const { app } = setupBootstrapApp({
      bootstrapConfig: [
        {
          id: "singleton",
          bootstrapTokenHash: bcrypt.hashSync("used-token", 10),
          bootstrapTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
          isInitialized: true,
        },
      ],
    });

    const response = await request(app).get("/api/bootstrap/status");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: expect.any(String),
        data: { isBootstrapped: true },
      }),
    );
  });

  it("returns a bootstrap token and persists only its hash", async () => {
    const { app, storageAdapter } = setupBootstrapApp();

    const response = await request(app)
      .post("/api/bootstrap/token")
      .send({ expirationMinutes: 30 });

    const persistedConfigs = snapshotBootstrapConfig(storageAdapter);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: expect.any(String),
        data: expect.objectContaining({
          bootstrapToken: expect.stringMatching(/^[a-f0-9]{64}$/),
          expiresAt: expect.any(String),
        }),
      }),
    );
    expect(persistedConfigs).toHaveLength(1);
    expect(persistedConfigs[0]).toEqual(
      expect.objectContaining({
        id: "singleton",
        isInitialized: false,
      }),
    );
    expect(persistedConfigs[0].bootstrapTokenHash).not.toBe(response.body.data.bootstrapToken);
    expect(
      bcrypt.compareSync(response.body.data.bootstrapToken, persistedConfigs[0].bootstrapTokenHash),
    ).toBe(true);
  });

  it("returns a 409 when generating a token for an initialized system", async () => {
    const { app } = setupBootstrapApp({
      bootstrapConfig: [
        {
          id: "singleton",
          bootstrapTokenHash: bcrypt.hashSync("used-token", 10),
          bootstrapTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
          isInitialized: true,
        },
      ],
    });

    const response = await request(app)
      .post("/api/bootstrap/token")
      .send({ expirationMinutes: 30 });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        status: 409,
        statusText: "CONFLICT",
        timestamp: expect.any(String),
        message: "System is already bootstrapped",
        data: null,
      }),
    );
  });

  it("creates the admin user and marks the system initialized when the bootstrap token is valid", async () => {
    const { app, storageAdapter } = setupBootstrapApp();

    const tokenResponse = await request(app)
      .post("/api/bootstrap/token")
      .send({ expirationMinutes: 30 });

    const response = await request(app).post("/api/bootstrap/admin").send({
      token: tokenResponse.body.data.bootstrapToken,
      googleId: "google-admin-success",
      email: "bootstrap.admin@test.com",
      name: "Bootstrap Admin",
    });

    const persistedUsers = snapshotUsers(storageAdapter);
    const persistedConfigs = snapshotBootstrapConfig(storageAdapter);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: expect.any(String),
        data: expect.objectContaining({
          id: expect.any(String),
          email: "bootstrap.admin@test.com",
          name: "Bootstrap Admin",
          role: "admin",
        }),
      }),
    );
    expect(response.body.data).not.toHaveProperty("googleId");
    expect(persistedUsers).toEqual([
      expect.objectContaining({
        googleId: "google-admin-success",
        email: "bootstrap.admin@test.com",
        name: "Bootstrap Admin",
        role: "admin",
      }),
    ]);
    expect(persistedConfigs).toEqual([
      expect.objectContaining({
        id: "singleton",
        isInitialized: true,
      }),
    ]);
  });

  it("returns 400 when the bootstrap token is invalid", async () => {
    const { app, storageAdapter } = setupBootstrapApp({
      bootstrapConfig: [
        {
          id: "singleton",
          bootstrapTokenHash: bcrypt.hashSync("valid-token", 10),
          bootstrapTokenExpiresAt: new Date("2099-01-01T00:00:00.000Z"),
          isInitialized: false,
        },
      ],
    });

    const response = await request(app).post("/api/bootstrap/admin").send({
      token: "wrong-token",
      googleId: "google-admin-fail",
      email: "fail@test.com",
      name: "Failed Admin",
    });

    const persistedUsers = snapshotUsers(storageAdapter);
    const persistedConfigs = snapshotBootstrapConfig(storageAdapter);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        status: 400,
        statusText: "VALIDATION_ERROR",
        timestamp: expect.any(String),
        message: "Invalid bootstrap token",
        data: null,
      }),
    );
    expect(persistedUsers).toEqual([]);
    expect(persistedConfigs).toEqual([
      expect.objectContaining({
        id: "singleton",
        isInitialized: false,
      }),
    ]);
  });
});
