import request from "supertest";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import { seasons, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Season, SeasonParticipant, User } from "shared";

describe("Season routes integration", () => {
  type PersistedUserRecord = User & Record<string, unknown>;
  type PersistedSeasonRecord = Season & Record<string, unknown>;
  type PersistedParticipantRecord = SeasonParticipant & Record<string, unknown>;

  function seedUsers(storageAdapter: InMemoryStorageAdapter, records: User[]): void {
    storageAdapter.seed<PersistedUserRecord>("users", records as PersistedUserRecord[]);
  }

  function seedSeasons(storageAdapter: InMemoryStorageAdapter, records: Season[]): void {
    storageAdapter.seed<PersistedSeasonRecord>("seasons", records as PersistedSeasonRecord[]);
  }

  function seedParticipants(
    storageAdapter: InMemoryStorageAdapter,
    records: PersistedParticipantRecord[],
  ): void {
    storageAdapter.seed<PersistedParticipantRecord>("seasonParticipants", records);
  }

  function snapshotSeasons(storageAdapter: InMemoryStorageAdapter): Season[] {
    return storageAdapter.snapshot<PersistedSeasonRecord>("seasons");
  }

  function snapshotParticipants(storageAdapter: InMemoryStorageAdapter): SeasonParticipant[] {
    return storageAdapter.snapshot<PersistedParticipantRecord>("seasonParticipants");
  }

  function setupSeasonApp(
    options: {
      users?: User[];
      seasons?: Season[];
      participants?: PersistedParticipantRecord[];
    } = {},
  ) {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;

    seedUsers(storageAdapter, options.users ?? []);
    seedSeasons(storageAdapter, options.seasons ?? []);
    seedParticipants(storageAdapter, options.participants ?? []);
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
    it("returns the filtered public season list", async () => {
      const activeSeason = seasons.active();
      const upcomingSeason = seasons.upcoming();
      const { app } = setupSeasonApp({
        seasons: [{ ...activeSeason }, { ...upcomingSeason }],
      });

      const response = await request(app).get("/api/seasons").query({ status: "active" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "Successfully retrieved seasons",
          data: [
            expect.objectContaining({
              id: activeSeason.id,
              name: activeSeason.name,
              status: activeSeason.status,
            }),
          ],
        }),
      );
    });

    it("creates and persists a season for an admin user", async () => {
      const persistedAdmin = users.admin();
      const { app, container, storageAdapter } = setupSeasonApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const payload = {
        name: "Season 3 2026",
        startDate: "2026-09-01T00:00:00.000Z",
        status: "upcoming",
      };

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedSeasons = snapshotSeasons(storageAdapter);
      const createdSeason = persistedSeasons.find((season) => season.name === payload.name);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 201,
          statusText: "Created",
          timestamp: expect.any(String),
          message: "Successfully created season",
          data: expect.objectContaining({
            id: expect.any(String),
            name: payload.name,
            status: payload.status,
          }),
        }),
      );
      expect(createdSeason).toEqual(
        expect.objectContaining({
          name: payload.name,
          status: payload.status,
        }),
      );
    });

    it("joins a season and returns the authenticated participant list", async () => {
      const persistedUser = users.user({ id: "user-join-1", googleId: "google-join-1" });
      const activeSeason = seasons.active();
      const { app, container, storageAdapter } = setupSeasonApp({
        users: [{ ...persistedUser }],
        seasons: [{ ...activeSeason }],
      });
      const token = container.getAuthService().generateToken(persistedUser);

      const joinResponse = await request(app)
        .post(`/api/seasons/${activeSeason.id}/join/racer-1`)
        .set("Cookie", [`token=${token}`]);

      expect(joinResponse.status).toBe(201);
      expect(joinResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 201,
          statusText: "Created",
          timestamp: expect.any(String),
          message: "Successfully joined season",
          data: expect.objectContaining({
            seasonId: activeSeason.id,
            racerId: "racer-1",
          }),
        }),
      );
      expect(snapshotParticipants(storageAdapter)).toEqual([
        expect.objectContaining({
          seasonId: activeSeason.id,
          racerId: "racer-1",
        }),
      ]);

      const participantsResponse = await request(app)
        .get(`/api/seasons/${activeSeason.id}/participants`)
        .set("Cookie", [`token=${token}`]);

      expect(participantsResponse.status).toBe(200);
      expect(participantsResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "Successfully retrieved season participants",
          data: [
            expect.objectContaining({
              seasonId: activeSeason.id,
              racerId: "racer-1",
            }),
          ],
        }),
      );
    });

    it("returns 200 when no seasons exist", async () => {
      const { app } = setupSeasonApp();

      const response = await request(app).get("/api/seasons");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "No seasons found",
          data: [],
        }),
      );
    });

    it("returns a season by ID", async () => {
      const activeSeason = seasons.active();
      const { app } = setupSeasonApp({ seasons: [{ ...activeSeason }] });

      const response = await request(app).get(`/api/seasons/${activeSeason.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "Successfully retrieved season",
          data: expect.objectContaining({
            id: activeSeason.id,
            name: activeSeason.name,
            status: activeSeason.status,
          }),
        }),
      );
    });

    it("updates a season and persists the change for an admin user", async () => {
      const persistedAdmin = users.admin();
      const activeSeason = seasons.active();
      const { app, container, storageAdapter } = setupSeasonApp({
        users: [{ ...persistedAdmin }],
        seasons: [{ ...activeSeason }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const payload = { name: "Season 1 2026 - Updated", status: "completed" };

      const response = await request(app)
        .put(`/api/seasons/${activeSeason.id}`)
        .set("Cookie", [`token=${token}`])
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          message: "Successfully updated season",
          data: expect.objectContaining({
            id: activeSeason.id,
            name: payload.name,
            status: payload.status,
          }),
        }),
      );
      const persisted = snapshotSeasons(storageAdapter).find((s) => s.id === activeSeason.id);
      expect(persisted).toEqual(
        expect.objectContaining({ name: payload.name, status: payload.status }),
      );
    });

    it("deletes a season and removes it from storage for an admin user", async () => {
      const persistedAdmin = users.admin();
      const activeSeason = seasons.active();
      const { app, container, storageAdapter } = setupSeasonApp({
        users: [{ ...persistedAdmin }],
        seasons: [{ ...activeSeason }],
      });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .delete(`/api/seasons/${activeSeason.id}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(204);
      expect(snapshotSeasons(storageAdapter)).toEqual([]);
    });
  });

  describe("Unhappy paths", () => {
    it("returns 401 when creating a season without an auth cookie", async () => {
      const { app } = setupSeasonApp();

      const response = await request(app).post("/api/seasons").send({ name: "Unauthorized" });

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

    it("returns 403 when a non-admin user tries to create a season", async () => {
      const persistedUser = users.user();
      const { app, container } = setupSeasonApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .post("/api/seasons")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Forbidden Season" });

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

    it("returns 409 when the same racer joins the season twice", async () => {
      const persistedUser = users.user({ id: "user-join-2", googleId: "google-join-2" });
      const activeSeason = seasons.active();
      const existingParticipant: PersistedParticipantRecord = {
        id: `${activeSeason.id}:racer-1`,
        seasonId: activeSeason.id,
        racerId: "racer-1",
        registeredAt: new Date("2026-01-02T00:00:00.000Z"),
      };
      const { app, container, storageAdapter } = setupSeasonApp({
        users: [{ ...persistedUser }],
        seasons: [{ ...activeSeason }],
        participants: [existingParticipant],
      });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .post(`/api/seasons/${activeSeason.id}/join/racer-1`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(409);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 409,
          statusText: "CONFLICT",
          timestamp: expect.any(String),
          message: `Racer racer-1 is already registered for season ${activeSeason.id}`,
          data: null,
        }),
      );
      expect(snapshotParticipants(storageAdapter)).toEqual([
        expect.objectContaining({
          seasonId: activeSeason.id,
          racerId: "racer-1",
        }),
      ]);
    });

    it("returns 404 when the requested season does not exist", async () => {
      const { app } = setupSeasonApp();

      const response = await request(app).get("/api/seasons/missing-season");

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Season with ID missing-season not found",
          data: null,
        }),
      );
    });

    it("returns 404 when an admin tries to update a missing season", async () => {
      const persistedAdmin = users.admin();
      const { app, container } = setupSeasonApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .put("/api/seasons/missing-season")
        .set("Cookie", [`token=${token}`])
        .send({ name: "Updated name" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Season with ID missing-season not found",
          data: null,
        }),
      );
    });

    it("returns 404 when an admin tries to delete a missing season", async () => {
      const persistedAdmin = users.admin();
      const { app, container } = setupSeasonApp({ users: [{ ...persistedAdmin }] });
      const token = container.getAuthService().generateToken(persistedAdmin);

      const response = await request(app)
        .delete("/api/seasons/missing-season")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Season with ID missing-season not found",
          data: null,
        }),
      );
    });
  });
});
