import request from "supertest";
import { users } from "../../fixtures";
import { createTestApp } from "../../testApp";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";

describe("Auth routes integration", () => {
  // 1. Given no auth cookie, when requesting GET /api/auth/me, then the auth middleware returns the unauthorized envelope.
  // 2. Given an invalid auth cookie, when requesting GET /api/auth/me, then the auth middleware returns the invalid-token envelope.
  // 3. Given a valid auth cookie for a persisted user, when requesting GET /api/auth/me, then the route returns the current user through the real middleware, controller, and service stack.
  // 4. Given a valid auth cookie for a persisted user, when requesting POST /api/auth/logout, then the route blacklists the token, clears the cookie, and subsequent authenticated requests with that token are rejected.

  interface PersistedBlacklistedTokenRecord extends Record<string, unknown> {
    token: string;
    expiresAt: Date;
  }

  function snapshotBlacklistedTokens(
    storageAdapter: InMemoryStorageAdapter,
  ): PersistedBlacklistedTokenRecord[] {
    return storageAdapter.snapshot<PersistedBlacklistedTokenRecord>("blacklistedTokens");
  }

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  it("returns 401 when the auth cookie is missing", async () => {
    const container = createTestContainer();

    Container.setInstance(container);

    const app = createTestApp({ controllerFactory: container });

    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "Unauthorized: No token provided",
        data: null,
      }),
    );
  });

  it("returns 401 when the auth cookie contains an invalid token", async () => {
    const container = createTestContainer();

    Container.setInstance(container);

    const app = createTestApp({ controllerFactory: container });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["token=not-a-valid-jwt"]);

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "Unauthorized: Invalid token",
        data: null,
      }),
    );
  });

  it("returns the current user when a valid auth cookie is provided", async () => {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;
    const persistedUser = users.admin();
    const expectedLastLoginAt = persistedUser.lastLoginAt
      ? new Date(persistedUser.lastLoginAt).toISOString()
      : undefined;

    storageAdapter.seed("users", [{ ...persistedUser }]);
    Container.setInstance(container);

    const app = createTestApp({ controllerFactory: container });
    const token = container.getAuthService().generateToken(persistedUser);

    const response = await request(app).get("/api/auth/me").set("Cookie", [`token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
      }),
    );
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        email: persistedUser.email,
        name: persistedUser.name,
        role: persistedUser.role,
        loginCount: persistedUser.loginCount,
        lastLoginAt: expectedLastLoginAt,
      }),
    );
    expect(response.body.data).not.toHaveProperty("googleId");
    expect(response.body.data).not.toHaveProperty("racerId");
    expect(response.body.data).not.toHaveProperty("profilePicture");
  });

  it("blacklists the token on logout and rejects subsequent requests with the revoked token", async () => {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;
    const persistedUser = users.admin();

    storageAdapter.seed("users", [{ ...persistedUser }]);
    Container.setInstance(container);

    const app = createTestApp({ controllerFactory: container });
    const token = container.getAuthService().generateToken(persistedUser);

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [`token=${token}`]);

    const blacklistedTokens = snapshotBlacklistedTokens(storageAdapter);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: expect.any(String),
        data: null,
      }),
    );
    expect(logoutResponse.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("token=;")]),
    );
    expect(blacklistedTokens).toEqual([
      expect.objectContaining({
        token,
      }),
    ]);

    const meResponse = await request(app).get("/api/auth/me").set("Cookie", [`token=${token}`]);

    expect(meResponse.status).toBe(401);
    expect(meResponse.body).toEqual(
      expect.objectContaining({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "Unauthorized: Token has been revoked",
        data: null,
      }),
    );
  });
});