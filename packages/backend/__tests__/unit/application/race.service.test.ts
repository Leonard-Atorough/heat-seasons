import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { RaceCreateInput } from "../../../src/application/dtos/race.dto";
import { NotFoundError } from "../../../src/Infrastructure/errors/appError";
import { createRaceList, races, seasons } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";

interface PersistedRaceRecord extends Record<string, unknown> {
  id: string;
  seasonId: string;
  raceNumber: number;
  name: string;
  date: Date;
  completed: boolean;
  results: Array<Record<string, unknown>>;
}

describe("RaceService", () => {
  // 1. Given persisted races, when listing by season or fetching by id, then the service returns mapped race responses.
  // 2. Given a valid season, when creating a race, then the service assigns the next race number and persists the new race.
  // 3. Given a missing season, when creating a race, then the service throws a not found error.
  // 4. Given an existing race, when updating it, then the service persists the changes; and when the race is missing, it throws.
  // 5. Given an existing race, when deleting it, then the service removes it; and when the race is missing, it throws.
  // 6. Given the points calculator is not implemented, when it is called, then the service throws the expected error.

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

  it("lists races by season and fetches a race by id", async () => {
    const seasonRace = races.completed({ id: "race-season-1", seasonId: "season-1" });
    const anotherSeasonRace = races.pending({ id: "race-season-2", seasonId: "season-2" });

    storageAdapter.seed("races", [{ ...seasonRace }, { ...anotherSeasonRace }]);

    const raceService = container.getRaceService();
    const bySeason = await raceService.getBySeasonId("season-1");
    const byId = await raceService.getById(seasonRace.id);

    expect(bySeason).toEqual([
      expect.objectContaining({
        id: seasonRace.id,
        seasonId: seasonRace.seasonId,
        raceNumber: seasonRace.raceNumber,
        name: seasonRace.name,
      }),
    ]);
    expect(byId).toEqual(
      expect.objectContaining({
        id: seasonRace.id,
        seasonId: seasonRace.seasonId,
        completed: seasonRace.completed,
      }),
    );
  });

  it("throws when fetching a missing race by id", async () => {
    const raceService = container.getRaceService();

    await expect(raceService.getById("missing-race")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a race with the next race number for an existing season", async () => {
    const persistedSeason = seasons.active({ id: "season-1" });
    const existingRaces = createRaceList(2, { seasonId: persistedSeason.id });

    storageAdapter.seed("seasons", [{ ...persistedSeason }]);
    storageAdapter.seed(
      "races",
      existingRaces.map((race) => ({ ...race })),
    );

    const raceService = container.getRaceService();
    const input: RaceCreateInput = {
      seasonId: persistedSeason.id,
      name: "Grand Finale",
      raceNumber: 999,
      date: new Date("2026-03-30T00:00:00.000Z"),
      results: [],
    };

    const createdRace = await raceService.create(persistedSeason.id, input);
    const persistedRaces = storageAdapter.snapshot<PersistedRaceRecord>("races");

    expect(createdRace).toEqual(
      expect.objectContaining({
        seasonId: persistedSeason.id,
        name: input.name,
        raceNumber: 3,
        completed: false,
      }),
    );
    expect(persistedRaces).toHaveLength(3);
    expect(persistedRaces[2]).toEqual(
      expect.objectContaining({
        seasonId: persistedSeason.id,
        name: input.name,
        raceNumber: 3,
      }),
    );
  });

  it("throws when creating a race for a missing season", async () => {
    const raceService = container.getRaceService();

    await expect(
      raceService.create("missing-season", {
        seasonId: "missing-season",
        name: "Impossible Race",
        raceNumber: 1,
        date: new Date("2026-04-01T00:00:00.000Z"),
        results: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates an existing race and throws for a missing race", async () => {
    const persistedRace = races.pending({ id: "race-update-1", name: "Before Update" });

    storageAdapter.seed("races", [{ ...persistedRace }]);

    const raceService = container.getRaceService();
    const updatedRace = await raceService.update(persistedRace.id, {
      name: "After Update",
      completed: true,
      results: [
        {
          racerId: "racer-1",
          position: 1,
          points: 25,
          constructorPoints: 25,
          ghostRacer: false,
        },
      ],
    });
    const persistedRaces = storageAdapter.snapshot<PersistedRaceRecord>("races");

    expect(updatedRace).toEqual(
      expect.objectContaining({
        id: persistedRace.id,
        name: "After Update",
        completed: true,
      }),
    );
    expect(persistedRaces[0]).toEqual(
      expect.objectContaining({
        id: persistedRace.id,
        name: "After Update",
        completed: true,
      }),
    );

    await expect(raceService.update("missing-race", { name: "No Race" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("deletes an existing race and throws for a missing race", async () => {
    const persistedRace = races.pending({ id: "race-delete-1" });

    storageAdapter.seed("races", [{ ...persistedRace }]);

    const raceService = container.getRaceService();

    await raceService.delete(persistedRace.id);

    expect(await raceService.getBySeasonId(persistedRace.seasonId)).toEqual([]);
    expect(storageAdapter.snapshot<PersistedRaceRecord>("races")).toEqual([]);

    await expect(raceService.delete("missing-race")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws for the unimplemented points calculator", async () => {
    const raceService = container.getRaceService();

    await expect(raceService.calculatePoints(1)).rejects.toThrow("Not implemented");
  });
});
