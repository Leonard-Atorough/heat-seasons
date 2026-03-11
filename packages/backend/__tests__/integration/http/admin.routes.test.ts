import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import request from "supertest";
import { racers, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Racer, User } from "shared";

describe("Admin routes integration", () => {
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

  function setupAdminApp(options: { users?: User[]; racers?: Racer[] } = {}) {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;

    seedUsers(storageAdapter, options.users ?? []);
    seedRacers(storageAdapter, options.racers ?? []);
    Container.setInstance(container);

    const app = createTestApp({ controllerFactory: container });

    return { app, container, storageAdapter };
  }

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  describe("Happy path", () => {
    it("returns 200 and user list when the user is an admin", async () => {
      const persistedAdmin = users.admin();
      const { app, container } = setupAdminApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .get("/api/admin/users")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 200,
          success: true,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.arrayContaining([
            expect.objectContaining({
              id: persistedAdmin.id,
              email: persistedAdmin.email,
              role: persistedAdmin.role,
              lastLoginAt: persistedAdmin.lastLoginAt
                ? new Date(persistedAdmin.lastLoginAt).toISOString()
                : undefined,
              loginCount: persistedAdmin.loginCount,
              name: persistedAdmin.name,
            }),
          ]),
        }),
      );
    });

    it("returns 200 and an updated user when promoting a user to contributor", async () => {
      const persistedAdmin = users.admin();
      const persistedUser = users.user();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }, { ...persistedUser }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .post("/api/admin/promote")
        .set("Cookie", [`token=${token}`])
        .send({ userId: persistedUser.id });

      const persistedUsers = snapshotUsers(storageAdapter);
      const updatedUser = persistedUsers.find((user) => user.id === persistedUser.id);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 200,
          success: true,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: persistedUser.id,
            email: persistedUser.email,
            role: "contributor",
            loginCount: persistedUser.loginCount,
            name: persistedUser.name,
          }),
        }),
      );
      expect(updatedUser).toEqual(
        expect.objectContaining({
          id: persistedUser.id,
          role: "contributor",
        }),
      );
    });

    it("returns 200 and an updated user when demoting a contributor to user", async () => {
      const persistedAdmin = users.admin();
      const persistedContributor = users.contributor();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }, { ...persistedContributor }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .post("/api/admin/demote")
        .set("Cookie", [`token=${token}`])
        .send({ userId: persistedContributor.id });

      const persistedUsers = snapshotUsers(storageAdapter);
      const updatedUser = persistedUsers.find((user) => user.id === persistedContributor.id);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 200,
          success: true,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: persistedContributor.id,
            email: persistedContributor.email,
            role: "user",
            lastLoginAt: persistedContributor.lastLoginAt
              ? new Date(persistedContributor.lastLoginAt).toISOString()
              : undefined,
            loginCount: persistedContributor.loginCount,
            name: persistedContributor.name,
          }),
        }),
      );
      expect(updatedUser).toEqual(
        expect.objectContaining({
          id: persistedContributor.id,
          role: "user",
        }),
      );
    });

    it("returns 201 and persists a racer linked to the provided user", async () => {
      const persistedAdmin = users.admin();
      const persistedUser = users.user({ racerId: undefined });
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }, { ...persistedUser }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const payload = {
        userId: persistedUser.id,
        name: "Grid Runner",
        team: "Falcon",
        teamColor: "#123456",
        nationality: "FR",
        age: 27,
      };

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedRacers = snapshotRacers(storageAdapter);
      const createdRacer = persistedRacers.find((racer) => racer.name === payload.name);
      const persistedUsers = snapshotUsers(storageAdapter);
      const updatedUser = persistedUsers.find((user) => user.id === persistedUser.id);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 201,
          success: true,
          statusText: "Created",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            userId: persistedUser.id,
            name: payload.name,
            active: true,
            team: payload.team,
            teamColor: payload.teamColor,
            nationality: payload.nationality,
            age: payload.age,
          }),
        }),
      );
      expect(createdRacer).toEqual(
        expect.objectContaining({
          userId: persistedUser.id,
          name: payload.name,
          active: true,
        }),
      );
      expect(updatedUser).toEqual(
        expect.objectContaining({
          id: persistedUser.id,
          racerId: createdRacer?.id,
        }),
      );
    });

    it("returns 201 and persists an unassigned active racer when no userId is provided", async () => {
      const persistedAdmin = users.admin();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const payload = {
        name: "Free Agent",
        team: "Meteor",
        teamColor: "#abcdef",
        nationality: "CA",
        age: 24,
      };

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedRacers = snapshotRacers(storageAdapter);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 201,
          success: true,
          statusText: "Created",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            userId: null,
            name: payload.name,
            active: true,
          }),
        }),
      );
      expect(persistedRacers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: payload.name,
            userId: null,
            active: true,
          }),
        ]),
      );
    });

    it("returns 200 and the serialized racer list when the user is an admin", async () => {
      const persistedAdmin = users.admin();
      const firstRacer = racers.john();
      const secondRacer = racers.inactive({ id: "racer-2", name: "Night Driver" });
      const { app, container } = setupAdminApp({
        users: [{ ...persistedAdmin }],
        racers: [{ ...firstRacer }, { ...secondRacer }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .get("/api/admin/racers")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 200,
          success: true,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.arrayContaining([
            expect.objectContaining({
              id: firstRacer.id,
              name: firstRacer.name,
              active: firstRacer.active,
              team: firstRacer.team,
              stats: null,
            }),
            expect.objectContaining({
              id: secondRacer.id,
              name: secondRacer.name,
              active: secondRacer.active,
              team: secondRacer.team,
              stats: null,
            }),
          ]),
        }),
      );
    });

    it("returns 200 and persists racer updates when an admin edits a racer", async () => {
      const persistedAdmin = users.admin();
      const existingRacer = racers.john();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }],
        racers: [{ ...existingRacer }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const payload = {
        team: "Velocity Works",
        teamColor: "#00ffaa",
        active: false,
      };

      const response = await request(app)
        .put(`/api/admin/racers/${existingRacer.id}`)
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedRacers = snapshotRacers(storageAdapter);
      const updatedRacer = persistedRacers.find((racer) => racer.id === existingRacer.id);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 200,
          success: true,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: existingRacer.id,
            team: payload.team,
            teamColor: payload.teamColor,
            active: payload.active,
          }),
        }),
      );
      expect(updatedRacer).toEqual(
        expect.objectContaining({
          id: existingRacer.id,
          team: payload.team,
          teamColor: payload.teamColor,
          active: payload.active,
        }),
      );
    });

    it("returns 204 and removes the racer when an admin deletes an existing racer", async () => {
      const persistedAdmin = users.admin();
      const existingRacer = racers.john();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }],
        racers: [{ ...existingRacer }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .delete(`/api/admin/racers/${existingRacer.id}`)
        .set("Cookie", [`token=${token}`]);

      const persistedRacers = snapshotRacers(storageAdapter);

      expect(response.status).toBe(204);
      expect(persistedRacers).toEqual([]);
    });
  });

  describe("Unhappy paths", () => {
    it("returns 401 when the auth cookie is missing", async () => {
      const { app } = setupAdminApp();

      const response = await request(app).get("/api/admin/users");

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

    it("returns 403 when the user is not an admin", async () => {
      const persistedUser = users.user();
      const { app, container } = setupAdminApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .get("/api/admin/users")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 403,
          success: false,
          statusText: "Forbidden",
          message: "Access denied. Required role: admin",
          data: null,
        }),
      );
    });

    it("returns 400 and does not change persisted state when an admin tries to promote themselves", async () => {
      const persistedAdmin = users.admin();
      const { app, container, storageAdapter } = setupAdminApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .post("/api/admin/promote")
        .set("Cookie", [`token=${token}`])
        .send({ userId: persistedAdmin.id });

      const persistedUsers = snapshotUsers(storageAdapter);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "Cannot promote yourself",
          data: null,
        }),
      );
      expect(persistedUsers).toEqual([
        expect.objectContaining({ id: persistedAdmin.id, role: "admin" }),
      ]);
    });

    it("returns 400 and does not change persisted state when an admin tries to demote themselves", async () => {
      const persistedAdmin = users.admin();
      const { app, container, storageAdapter } = setupAdminApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .post("/api/admin/demote")
        .set("Cookie", [`token=${token}`])
        .send({ userId: persistedAdmin.id });

      const persistedUsers = snapshotUsers(storageAdapter);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "Cannot demote yourself",
          data: null,
        }),
      );
      expect(persistedUsers).toEqual([
        expect.objectContaining({ id: persistedAdmin.id, role: "admin" }),
      ]);
    });

    it("returns 400 and does not create a racer when required fields are missing", async () => {
      const persistedAdmin = users.admin();
      const existingRacer = racers.john();
      const { app, container, storageAdapter } = setupAdminApp({
        users: [{ ...persistedAdmin }],
        racers: [{ ...existingRacer }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .post("/api/admin/racers")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Incomplete Racer" });

      const persistedRacers = snapshotRacers(storageAdapter);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "name, team, teamColor, nationality and age are required",
          data: null,
        }),
      );
      expect(persistedRacers).toEqual([expect.objectContaining({ id: existingRacer.id })]);
    });

    it("returns 404 when an admin tries to update a missing racer", async () => {
      const persistedAdmin = users.admin();
      const { app, container } = setupAdminApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .put("/api/admin/racers/missing-racer")
        .set("Cookie", [`token=${token}`])
        .send({ team: "Ghost Team" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 404,
          success: false,
          statusText: "NOT_FOUND",
          message: "Racer with ID missing-racer not found",
          data: null,
        }),
      );
    });

    it("returns 404 when an admin tries to delete a missing racer", async () => {
      const persistedAdmin = users.admin();
      const { app, container } = setupAdminApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .delete("/api/admin/racers/missing-racer")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 404,
          success: false,
          statusText: "NOT_FOUND",
          message: "Racer with ID missing-racer not found",
          data: null,
        }),
      );
    });
  });
});
