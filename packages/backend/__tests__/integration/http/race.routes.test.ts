import request from "supertest";
import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { createTestApp } from "../../testApp";
import { races, seasons, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { Race, Season, User } from "shared";

describe("Race routes integration", () => {

  type PersistedUserRecord = User & Record<string, unknown>;
  type PersistedSeasonRecord = Season & Record<string, unknown>;
  type PersistedRaceRecord = Race & Record<string, unknown>;

  function seedUsers(storageAdapter: InMemoryStorageAdapter, records: User[]): void {
    storageAdapter.seed<PersistedUserRecord>("users", records as PersistedUserRecord[]);
  }

  function seedSeasons(storageAdapter: InMemoryStorageAdapter, records: Season[]): void {
    storageAdapter.seed<PersistedSeasonRecord>("seasons", records as PersistedSeasonRecord[]);
  }

  function seedRaces(storageAdapter: InMemoryStorageAdapter, records: Race[]): void {
    storageAdapter.seed<PersistedRaceRecord>("races", records as PersistedRaceRecord[]);
  }

  function snapshotRaces(storageAdapter: InMemoryStorageAdapter): Race[] {
    return storageAdapter.snapshot<PersistedRaceRecord>("races");
  }

  function setupRaceApp(options: { users?: User[]; seasons?: Season[]; races?: Race[] } = {}) {
    const container = createTestContainer();
    const storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;

    seedUsers(storageAdapter, options.users ?? []);
    seedSeasons(storageAdapter, options.seasons ?? []);
    seedRaces(storageAdapter, options.races ?? []);
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
    it("returns races for a season query", async () => {
      const season = seasons.active();
      const firstRace = races.race1({ seasonId: season.id });
      const secondRace = races.completed({ id: "race-2", seasonId: season.id });
      const { app } = setupRaceApp({
        seasons: [{ ...season }],
        races: [{ ...firstRace }, { ...secondRace }],
      });

      const response = await request(app).get("/api/races").query({ seasonId: season.id });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.arrayContaining([
            expect.objectContaining({ id: firstRace.id, seasonId: season.id, name: firstRace.name }),
            expect.objectContaining({ id: secondRace.id, seasonId: season.id, name: secondRace.name }),
          ]),
        }),
      );
    });

    it("returns a race by id", async () => {
      const persistedRace = races.race1();
      const { app } = setupRaceApp({ races: [{ ...persistedRace }] });

      const response = await request(app).get(`/api/races/${persistedRace.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: persistedRace.id,
            seasonId: persistedRace.seasonId,
            name: persistedRace.name,
          }),
        }),
      );
    });

    it("creates a race with the next race number for a contributor", async () => {
      const persistedContributor = users.contributor();
      const activeSeason = seasons.active();
      const existingRace = races.race1({ seasonId: activeSeason.id, raceNumber: 1 });
      const { app, container, storageAdapter } = setupRaceApp({
        users: [{ ...persistedContributor }],
        seasons: [{ ...activeSeason }],
        races: [{ ...existingRace }],
      });
      const token = container.getAuthService().generateToken(persistedContributor);

      const payload = {
        name: "Feature Race",
        date: "2026-02-01T00:00:00.000Z",
        completed: false,
        results: [],
      };

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: activeSeason.id })
        .set("Cookie", [`token=${token}`])
        .send(payload);

      const persistedRaces = snapshotRaces(storageAdapter);
      const createdRace = persistedRaces.find((race) => race.name === payload.name);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 201,
          statusText: "Created",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            seasonId: activeSeason.id,
            name: payload.name,
            raceNumber: 2,
          }),
        }),
      );
      expect(createdRace).toEqual(
        expect.objectContaining({
          seasonId: activeSeason.id,
          name: payload.name,
          raceNumber: 2,
        }),
      );
    });

    it("updates and deletes an existing race for a contributor", async () => {
      const persistedContributor = users.contributor();
      const existingRace = races.pending();
      const { app, container, storageAdapter } = setupRaceApp({
        users: [{ ...persistedContributor }],
        races: [{ ...existingRace }],
      });
      const token = container.getAuthService().generateToken(persistedContributor);

      const updateResponse = await request(app)
        .put(`/api/races/${existingRace.id}`)
        .set("Cookie", [`token=${token}`])
        .send({ completed: true, name: "Updated Race" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: expect.objectContaining({
            id: existingRace.id,
            completed: true,
            name: "Updated Race",
          }),
        }),
      );
      expect(snapshotRaces(storageAdapter)).toEqual([
        expect.objectContaining({
          id: existingRace.id,
          completed: true,
          name: "Updated Race",
        }),
      ]);

      const deleteResponse = await request(app)
        .delete(`/api/races/${existingRace.id}`)
        .set("Cookie", [`token=${token}`]);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          timestamp: expect.any(String),
          data: null,
        }),
      );
      expect(snapshotRaces(storageAdapter)).toEqual([]);
    });
  });

  describe("Unhappy paths", () => {
    it("returns 400 when seasonId is missing from GET /api/races", async () => {
      const { app } = setupRaceApp();

      const response = await request(app).get("/api/races");

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 400,
          statusText: "Bad Request",
          message: "seasonId query parameter is required",
        }),
      );
    });

    it("returns 401 when creating a race without an auth cookie", async () => {
      const { app } = setupRaceApp();

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "season-1" })
        .send({ name: "Unauthorized Race" });

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

    it("returns 403 when a regular user tries to create a race", async () => {
      const persistedUser = users.user();
      const { app, container } = setupRaceApp({ users: [{ ...persistedUser }] });
      const token = container.getAuthService().generateToken(persistedUser);

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "season-1" })
        .set("Cookie", [`token=${token}`])
        .send({ name: "Forbidden Race" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 403,
          success: false,
          statusText: "Forbidden",
          message: "Access denied. Required role: contributor or admin",
          data: null,
        }),
      );
    });

    it("returns 404 when a race lookup by id misses", async () => {
      const { app } = setupRaceApp();

      const response = await request(app).get("/api/races/missing-race");

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Race with ID missing-race not found",
          data: null,
        }),
      );
    });

    it("returns 404 when creating a race for a missing season", async () => {
      const persistedContributor = users.contributor();
      const { app, container } = setupRaceApp({ users: [{ ...persistedContributor }] });
      const token = container.getAuthService().generateToken(persistedContributor);

      const response = await request(app)
        .post("/api/races")
        .query({ seasonId: "missing-season" })
        .set("Cookie", [`token=${token}`])
        .send({ name: "Missing Season Race", date: "2026-01-01", results: [] });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Season not found",
          data: null,
        }),
      );
    });

    it("returns 404 when updating or deleting a missing race", async () => {
      const persistedContributor = users.contributor();
      const { app, container } = setupRaceApp({ users: [{ ...persistedContributor }] });
      const token = container.getAuthService().generateToken(persistedContributor);

      const updateResponse = await request(app)
        .put("/api/races/missing-race")
        .set("Cookie", [`token=${token}`])
        .send({ completed: true });

      expect(updateResponse.status).toBe(404);
      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Race with ID missing-race not found",
          data: null,
        }),
      );

      const deleteResponse = await request(app)
        .delete("/api/races/missing-race")
        .set("Cookie", [`token=${token}`]);

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toEqual(
        expect.objectContaining({
          success: false,
          status: 404,
          statusText: "NOT_FOUND",
          timestamp: expect.any(String),
          message: "Race with ID missing-race not found",
          data: null,
        }),
      );
    });
  });
});