import request from "supertest";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import { racers, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Racer, User } from "shared";

describe("Racer routes integration", () => {
  type PersistedUserRecord = User & Record<string, unknown>;
  type PersistedRacerRecord = Racer & Record<string, unknown>;

  function seedUsers(storageAdapter: InMemoryStorageAdapter, records: User[]): void {
    storageAdapter.seed<PersistedUserRecord>("users", records as PersistedUserRecord[]);
  }

  function seedRacers(storageAdapter: InMemoryStorageAdapter, records: Racer[]): void {
    storageAdapter.seed<PersistedRacerRecord>("racers", records as PersistedRacerRecord[]);
  }

  function snapshotUsers(storageAdapter: InMemoryStorageAdapter): User[] {
    return storageAdapter.snapshot<PersistedUserRecord>("users");
  }

  function snapshotRacers(storageAdapter: InMemoryStorageAdapter): Racer[] {
    return storageAdapter.snapshot<PersistedRacerRecord>("racers");
  }

  function setupRacerApp(options: { users?: User[]; racers?: Racer[] } = {}) {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;

    seedUsers(storageAdapter, options.users ?? []);
    seedRacers(storageAdapter, options.racers ?? []);
    Container.setInstance(container);

    return {
      app: createTestApp({ controllerFactory: container }),
      container,
      storageAdapter,
    };
  }

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  describe("Happy path", () => {
    it("returns the filtered racer list for public GET /api/racers requests", async () => {
      const activeRacer = racers.john();
      const inactiveRacer = racers.inactive({ id: "racer-2", name: "Night Driver" });
      const { app } = setupRacerApp({ racers: [{ ...activeRacer }, { ...inactiveRacer }] });

      const response = await request(app).get("/api/racers").query({ active: "true" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "Successfully retrieved 1 racers",
          data: [
            expect.objectContaining({
              id: activeRacer.id,
              name: activeRacer.name,
              active: true,
              stats: null,
            }),
          ],
        }),
      );
    });

    it("returns a racer by id for public GET /api/racers/:id requests", async () => {
      const persistedRacer = racers.jane();
      const { app } = setupRacerApp({ racers: [{ ...persistedRacer }] });

      const response = await request(app).get(`/api/racers/${persistedRacer.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: persistedRacer.id,
            name: persistedRacer.name,
            team: persistedRacer.team,
            stats: null,
          }),
        }),
      );
    });

    it("returns the authenticated user's racer for GET /api/racers/me", async () => {
      const persistedUser = users.withRacerId("racer-1", { role: "user" });
      const persistedRacer = racers.assignedToUser(persistedUser.id, { id: "racer-1" });
      const { app, container } = setupRacerApp({
        users: [{ ...persistedUser }],
        racers: [{ ...persistedRacer }],
      });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .get("/api/racers/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: persistedRacer.id,
            userId: persistedUser.id,
            name: persistedRacer.name,
            stats: null,
          }),
        }),
      );
    });

    it("creates a racer for the authenticated user and ignores forged ownership", async () => {
      const persistedUser = users.user({
        id: "user-7",
        googleId: "google-user-7",
        racerId: undefined,
      });
      const { app, container, storageAdapter } = setupRacerApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const payload = {
        userId: "forged-user",
        name: "Track Star",
        team: "Aurora",
        teamColor: "#123abc",
        nationality: "FR",
        age: 25,
      };

      const response = await request(app)
        .post("/api/racers")
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedRacers = snapshotRacers(storageAdapter);
      const createdRacer = persistedRacers.find((racer) => racer.name === payload.name);
      const persistedUsers = snapshotUsers(storageAdapter);
      const updatedUser = persistedUsers.find((user) => user.id === persistedUser.id);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 201,
          statusText: "Created",
          timestamp: expect.any(String),
          message: "Racer created successfully",
          data: expect.objectContaining({
            id: expect.any(String),
            userId: persistedUser.id,
            name: payload.name,
            team: payload.team,
          }),
        }),
      );
      expect(createdRacer).toEqual(
        expect.objectContaining({
          userId: persistedUser.id,
          name: payload.name,
        }),
      );
      expect(updatedUser).toEqual(
        expect.objectContaining({
          id: persistedUser.id,
          racerId: createdRacer?.id,
        }),
      );
    });

    it("updates and deletes an existing racer for authenticated write routes", async () => {
      const persistedUser = users.withRacerId("racer-1", { role: "user" });
      const existingRacer = racers.assignedToUser(persistedUser.id, { id: "racer-1" });
      const { app, container, storageAdapter } = setupRacerApp({
        users: [{ ...persistedUser }],
        racers: [{ ...existingRacer }],
      });
      const token = container.getAuthService().generateToken(persistedUser);

      const updateResponse = await request(app)
        .put(`/api/racers/${existingRacer.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ team: "Solaris", active: false });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: existingRacer.id,
            team: "Solaris",
            active: false,
          }),
        }),
      );
      expect(snapshotRacers(storageAdapter)).toEqual([
        expect.objectContaining({
          id: existingRacer.id,
          team: "Solaris",
          active: false,
        }),
      ]);

      const deleteResponse = await request(app)
        .delete(`/api/racers/${existingRacer.id}`)
        .set("Cookie", [`token=${token}`]);

      expect(deleteResponse.status).toBe(204);
      expect(snapshotRacers(storageAdapter)).toEqual([]);
    });
  });

  describe("Unhappy paths", () => {
    it("returns 401 when GET /api/racers/me is requested without an auth cookie", async () => {
      const { app } = setupRacerApp();

      const response = await request(app).get("/api/racers/me");

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

    it("returns 404 when a public GET /api/racers/:id lookup misses", async () => {
      const { app } = setupRacerApp();

      const response = await request(app).get("/api/racers/missing-racer");

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "Not Found",
          timestamp: expect.any(String),
          message: "Racer not found",
          data: null,
        }),
      );
    });

    it("returns 404 when GET /api/racers/me finds no racer for the authenticated user", async () => {
      const persistedUser = users.user({ id: "user-no-racer", googleId: "google-no-racer" });
      const { app, container } = setupRacerApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .get("/api/racers/me")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "Not Found",
          timestamp: expect.any(String),
          message: "No racer found for this user",
          data: null,
        }),
      );
    });

    it("returns the shared 404 error envelope when updating or deleting a missing racer", async () => {
      const persistedUser = users.user();
      const { app, container } = setupRacerApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const updateResponse = await request(app)
        .put("/api/racers/missing-racer")
        .set("Cookie", [`token=${token}`])
        .send({ team: "Ghost Team" });

      expect(updateResponse.status).toBe(404);
      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Racer with ID missing-racer not found",
          data: null,
        }),
      );

      const deleteResponse = await request(app)
        .delete("/api/racers/missing-racer")
        .set("Cookie", [`token=${token}`]);

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Racer with ID missing-racer not found",
          data: null,
        }),
      );
    });
  });
});
