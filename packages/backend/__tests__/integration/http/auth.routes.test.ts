import request from "supertest";
import { users } from "../../fixtures";
import { createTestApp } from "../../testApp";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";

describe("Auth routes integration", () => {
  // 1. Given no auth cookie, when requesting GET /api/auth/me, then the auth middleware returns the unauthorized envelope.
  // 2. Given a valid auth cookie for a persisted user, when requesting GET /api/auth/me, then the route returns the current user through the real middleware, controller, and service stack.

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
});