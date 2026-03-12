/**
 * Integration tests for request validation middleware.
 *
 * These tests exercise the Zod validation layer applied to all mutating routes,
 * verifying that malformed or incomplete bodies and params are rejected with 400
 * before reaching the service layer.
 */

import request from "supertest";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import { seasons, users, racers, races } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Season, User, Racer, Race } from "shared";

describe("Request validation middleware", () => {
  type PersistedUser = User & Record<string, unknown>;
  type PersistedSeason = Season & Record<string, unknown>;
  type PersistedRacer = Racer & Record<string, unknown>;
  type PersistedRace = Race & Record<string, unknown>;

  function setupApp(
    options: {
      users?: User[];
      seasons?: Season[];
      racers?: Racer[];
      races?: Race[];
    } = {},
  ) {
    const container = createTestContainer();
    const storage = container.getStorageAdapter() as InMemoryStorageAdapter;

    storage.seed<PersistedUser>("users", (options.users ?? []) as PersistedUser[]);
    storage.seed<PersistedSeason>("seasons", (options.seasons ?? []) as PersistedSeason[]);
    storage.seed<PersistedRacer>("racers", (options.racers ?? []) as PersistedRacer[]);
    storage.seed<PersistedRace>("races", (options.races ?? []) as PersistedRace[]);

    Container.setInstance(container);
    return { app: createTestApp({ controllerFactory: container }), container, storage };
  }

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  /**
   * Shared shape expected for all validation error responses
   */
  function expectValidationError(body: Record<string, unknown>) {
    expect(body).toEqual(
      expect.objectContaining({
        success: false,
        status: 400,
        statusText: "VALIDATION_ERROR",
        message: "Request validation failed",
        data: null,
      }),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bootstrap
  // ─────────────────────────────────────────────────────────────────────────────

  describe("POST /api/bootstrap/token", () => {
    it("returns 400 when expirationMinutes is zero", async () => {
      const { app } = setupApp();
      const response = await request(app)
        .post("/api/bootstrap/token")
        .send({ expirationMinutes: 0 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when expirationMinutes exceeds 7 days (10080 minutes)", async () => {
      const { app } = setupApp();
      const response = await request(app)
        .post("/api/bootstrap/token")
        .send({ expirationMinutes: 10081 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when expirationMinutes is a non-integer number", async () => {
      const { app } = setupApp();
      const response = await request(app)
        .post("/api/bootstrap/token")
        .send({ expirationMinutes: 1.5 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("accepts a request with no body (uses default expiration)", async () => {
      const { app } = setupApp();
      const response = await request(app).post("/api/bootstrap/token").send({});

      // System may reject with 409 (already initialised) but NOT 400 validation error
      expect(response.status).not.toBe(400);
    });
  });

  describe("POST /api/bootstrap/admin", () => {
    it("returns 400 when token is missing", async () => {
      const { app } = setupApp();
      const response = await request(app).post("/api/bootstrap/admin").send({
        googleId: "google-123",
        email: "admin@test.com",
        name: "Admin",
      });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when email is not a valid email address", async () => {
      const { app } = setupApp();
      const response = await request(app).post("/api/bootstrap/admin").send({
        token: "some-token",
        googleId: "google-123",
        email: "not-an-email",
        name: "Admin",
      });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when name is empty", async () => {
      const { app } = setupApp();
      const response = await request(app).post("/api/bootstrap/admin").send({
        token: "some-token",
        googleId: "google-123",
        email: "admin@test.com",
        name: "",
      });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when googleId is missing", async () => {
      const { app } = setupApp();
      const response = await request(app).post("/api/bootstrap/admin").send({
        token: "some-token",
        email: "admin@test.com",
        name: "Admin",
      });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Seasons
  // ─────────────────────────────────────────────────────────────────────────────

  describe("POST /api/seasons", () => {
    it("returns 400 when name is missing", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ startDate: "2026-09-01T00:00:00.000Z", status: "upcoming" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when name is too short (< 2 chars)", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ name: "A", startDate: "2026-09-01T00:00:00.000Z" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when name exceeds 100 characters", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ name: "A".repeat(101), startDate: "2026-09-01T00:00:00.000Z" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when startDate is not a valid date string", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Season X", startDate: "not-a-date" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when status is not one of the allowed values", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Season X", startDate: "2026-09-01", status: "invalid-status" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("PUT /api/seasons/:id", () => {
    it("returns 400 when name is too long (> 100 chars)", async () => {
      const admin = users.admin();
      const season = seasons.active();
      const { app, container } = setupApp({ users: [{ ...admin }], seasons: [{ ...season }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .put(`/api/seasons/${season.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ name: "B".repeat(101) });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Racers
  // ─────────────────────────────────────────────────────────────────────────────

  describe("POST /api/racers", () => {
    it("returns 400 when name is missing", async () => {
      const user = users.user();
      const { app, container } = setupApp({ users: [{ ...user }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send({ team: "Team A", teamColor: "#FF0000", nationality: "US", age: 25 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when age is below minimum (< 8)", async () => {
      const user = users.user();
      const { app, container } = setupApp({ users: [{ ...user }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send({
          name: "Young Driver",
          team: "Team A",
          teamColor: "#FF0000",
          nationality: "US",
          age: 5,
        });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when age is above maximum (> 120)", async () => {
      const user = users.user();
      const { app, container } = setupApp({ users: [{ ...user }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send({
          name: "Old Driver",
          team: "Team A",
          teamColor: "#FF0000",
          nationality: "US",
          age: 200,
        });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when teamColor is not a valid hex color", async () => {
      const user = users.user();
      const { app, container } = setupApp({ users: [{ ...user }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Driver", team: "Team A", teamColor: "red", nationality: "US", age: 25 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when badgeUrl is not a valid URL", async () => {
      const user = users.user();
      const { app, container } = setupApp({ users: [{ ...user }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send({
          name: "Driver",
          team: "Team A",
          teamColor: "#FF0000",
          nationality: "US",
          age: 25,
          badgeUrl: "not-a-url",
        });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("PUT /api/racers/:id", () => {
    it("returns 400 when teamColor in update is not a valid hex color", async () => {
      const user = users.user();
      const racer = racers.john();
      const { app, container } = setupApp({ users: [{ ...user }], racers: [{ ...racer }] });
      const token = container.getAuthService().generateToken(user);

      const response = await request(app)
        .put(`/api/racers/${racer.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ teamColor: "not-a-color" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Races
  // ─────────────────────────────────────────────────────────────────────────────

  describe("POST /api/races", () => {
    it("returns 400 when name is missing", async () => {
      const contributor = users.contributor();
      const { app, container } = setupApp({ users: [{ ...contributor }] });
      const token = container.getAuthService().generateToken(contributor);

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "season-1" })
        .set("Cookie", [`token=${token}`])
        .send({ date: "2026-02-01T00:00:00.000Z" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when date is not a valid date string", async () => {
      const contributor = users.contributor();
      const { app, container } = setupApp({ users: [{ ...contributor }] });
      const token = container.getAuthService().generateToken(contributor);

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "season-1" })
        .set("Cookie", [`token=${token}`])
        .send({ name: "Race X", date: "not-a-date" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when name is too short (< 2 chars)", async () => {
      const contributor = users.contributor();
      const { app, container } = setupApp({ users: [{ ...contributor }] });
      const token = container.getAuthService().generateToken(contributor);

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "season-1" })
        .set("Cookie", [`token=${token}`])
        .send({ name: "X", date: "2026-02-01T00:00:00.000Z" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("PUT /api/races/:id", () => {
    it("returns 400 when date in update is not a valid date string", async () => {
      const contributor = users.contributor();
      const race = races.race1();
      const { app, container } = setupApp({ users: [{ ...contributor }], races: [{ ...race }] });
      const token = container.getAuthService().generateToken(contributor);

      const response = await request(app)
        .put(`/api/races/${race.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ date: "bad-date" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin racers
  // ─────────────────────────────────────────────────────────────────────────────

  describe("POST /api/admin/racers", () => {
    it("returns 400 when all required racer fields are missing", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send({});

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when age is out of range", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Driver", team: "Team", teamColor: "#FF0000", nationality: "US", age: 300 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when teamColor format is invalid", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Driver", team: "Team", teamColor: "blue", nationality: "US", age: 30 });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("PUT /api/admin/racers/:racerId", () => {
    it("returns 400 when teamColor in update is invalid", async () => {
      const admin = users.admin();
      const racer = racers.john();
      const { app, container } = setupApp({ users: [{ ...admin }], racers: [{ ...racer }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .put(`/api/admin/racers/${racer.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ teamColor: "not-valid" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("POST /api/admin/promote", () => {
    it("returns 400 when userId is missing", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/promote")
        .set("Cookie", [`token=${token}`])
        .send({});

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });

    it("returns 400 when userId is an empty string", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/promote")
        .set("Cookie", [`token=${token}`])
        .send({ userId: "" });

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });

  describe("POST /api/admin/demote", () => {
    it("returns 400 when userId is missing", async () => {
      const admin = users.admin();
      const { app, container } = setupApp({ users: [{ ...admin }] });
      const token = container.getAuthService().generateToken(admin);

      const response = await request(app)
        .post("/api/admin/demote")
        .set("Cookie", [`token=${token}`])
        .send({});

      expect(response.status).toBe(400);
      expectValidationError(response.body);
    });
  });
});
