import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { SeasonCreateInput } from "../../../src/application/dtos";
import {
  ConflictError,
  NotFoundError,
  WriteError,
} from "../../../src/domain/errors";
import { RepositoryWriteError } from "../../../src/Infrastructure/errors";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";
import { createSeasonList, seasons } from "../../fixtures";

interface PersistedSeasonRecord extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  startDate: Date;
  endDate?: Date;
}

interface PersistedSeasonParticipantRecord extends Record<string, unknown> {
  id: string;
  seasonId: string;
  racerId: string;
  registeredAt: Date;
}

describe("SeasonService", () => {
  // 1. Given persisted seasons, when listing or fetching them, then the service returns matching season responses and respects status filters.
  // 2. Given no persisted seasons, when listing seasons, then the service returns an empty list; fetching a missing season still throws.
  // 3. Given valid season input, when creating a season, then the service persists it with the default upcoming status.
  // 4. Given an existing season, when joining and listing participants, then the service persists the participant; and when the season is missing or the racer is already joined, it throws.
  // 5. Given a repository write failure, when creating a season, then the service translates it into a season application error and preserves cause.
  // 6. Given an existing season, when updating it to completed without an end date, then the service assigns an end date automatically; and when the season is missing, it throws.
  // 6. Given an existing season, when deleting it, then the service removes it; and when the season is missing, it throws.

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

  it("lists seasons, applies status filters, and fetches a season by id", async () => {
    const activeSeason = seasons.active({ id: "season-active-1" });
    const completedSeason = seasons.completed({ id: "season-completed-1" });
    const upcomingSeason = seasons.upcoming({ id: "season-upcoming-1" });

    storageAdapter.seed("seasons", [
      { ...activeSeason },
      { ...completedSeason },
      { ...upcomingSeason },
    ]);

    const seasonService = container.getSeasonService();
    const activeOnly = await seasonService.getAll({ status: "active" });
    const byId = await seasonService.getById(completedSeason.id);

    expect(activeOnly).toEqual([
      expect.objectContaining({
        id: activeSeason.id,
        status: activeSeason.status,
        name: activeSeason.name,
      }),
    ]);
    expect(byId).toEqual(
      expect.objectContaining({
        id: completedSeason.id,
        status: completedSeason.status,
        endDate: completedSeason.endDate,
      }),
    );
  });

  it("returns an empty list for missing seasons and throws when fetching a missing season", async () => {
    const seasonService = container.getSeasonService();

    await expect(seasonService.getAll()).resolves.toEqual([]);
    await expect(seasonService.getById("missing-season")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a season with the default upcoming status", async () => {
    const seasonService = container.getSeasonService();
    const input: SeasonCreateInput = {
      name: "Season 3 2026",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
      endDate: new Date("2026-12-01T00:00:00.000Z"),
    };

    const createdSeason = await seasonService.create(input);
    const persistedSeasons = storageAdapter.snapshot<PersistedSeasonRecord>("seasons");

    expect(createdSeason).toEqual(
      expect.objectContaining({
        name: input.name,
        status: "upcoming",
        startDate: input.startDate,
        endDate: input.endDate,
      }),
    );
    expect(createdSeason.id).toBeTruthy();
    expect(persistedSeasons).toHaveLength(1);
    expect(persistedSeasons[0]).toEqual(
      expect.objectContaining({
        name: input.name,
        status: "upcoming",
      }),
    );
  });

  it("wraps repository write failures and preserves the original cause", async () => {
    const seasonService = container.getSeasonService();
    const input: SeasonCreateInput = {
      name: "Broken Season",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
      endDate: new Date("2026-12-01T00:00:00.000Z"),
    };
    const rootCause = new Error("disk full");

    jest.spyOn(storageAdapter, "create").mockRejectedValueOnce(rootCause);

    let thrownError: unknown;

    try {
      await seasonService.create(input);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(WriteError);
    expect((thrownError as WriteError).cause).toBeInstanceOf(RepositoryWriteError);
    expect(((thrownError as WriteError).cause as RepositoryWriteError).cause).toBe(rootCause);
  });

  it("adds and lists season participants, and throws for missing or duplicate registrations", async () => {
    const persistedSeason = seasons.active({ id: "season-join-1" });

    storageAdapter.seed("seasons", [{ ...persistedSeason }]);

    const seasonService = container.getSeasonService();
    const joinedParticipant = await seasonService.joinSeason(persistedSeason.id, "racer-1");
    const participants = await seasonService.getParticipants(persistedSeason.id);
    const persistedParticipants =
      storageAdapter.snapshot<PersistedSeasonParticipantRecord>("seasonParticipants");

    expect(joinedParticipant).toEqual(
      expect.objectContaining({
        seasonId: persistedSeason.id,
        racerId: "racer-1",
      }),
    );
    expect(joinedParticipant.registeredAt).toBeInstanceOf(Date);
    expect(participants).toEqual([
      expect.objectContaining({
        seasonId: persistedSeason.id,
        racerId: "racer-1",
      }),
    ]);
    expect(persistedParticipants).toEqual([
      expect.objectContaining({
        id: `${persistedSeason.id}:racer-1`,
        seasonId: persistedSeason.id,
        racerId: "racer-1",
      }),
    ]);

    await expect(seasonService.joinSeason(persistedSeason.id, "racer-1")).rejects.toBeInstanceOf(
      ConflictError,
    );
    await expect(seasonService.joinSeason("missing-season", "racer-2")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(seasonService.getParticipants("missing-season")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("updates a season and assigns an end date when completing an open season", async () => {
    const persistedSeason = seasons.active({ id: "season-update-1", endDate: undefined });

    storageAdapter.seed("seasons", [{ ...persistedSeason }]);

    const seasonService = container.getSeasonService();
    const updatedSeason = await seasonService.update(persistedSeason.id, {
      name: "Season Finale",
      status: "completed",
    });
    const persistedSeasons = storageAdapter.snapshot<PersistedSeasonRecord>("seasons");

    expect(updatedSeason).toEqual(
      expect.objectContaining({
        id: persistedSeason.id,
        name: "Season Finale",
        status: "completed",
      }),
    );
    expect(updatedSeason.endDate).toBeInstanceOf(Date);
    expect(persistedSeasons[0]).toEqual(
      expect.objectContaining({
        id: persistedSeason.id,
        name: "Season Finale",
        status: "completed",
      }),
    );
    expect(persistedSeasons[0].endDate).toBeInstanceOf(Date);

    await expect(
      seasonService.update("missing-season", { name: "No Season" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes an existing season and throws for a missing season", async () => {
    const persistedSeasons = createSeasonList(2);

    storageAdapter.seed(
      "seasons",
      persistedSeasons.map((season) => ({ ...season })),
    );

    const seasonService = container.getSeasonService();

    await seasonService.delete(persistedSeasons[0].id);

    expect(storageAdapter.snapshot<PersistedSeasonRecord>("seasons")).toEqual([
      expect.objectContaining({ id: persistedSeasons[1].id }),
    ]);

    await expect(seasonService.delete("missing-season")).rejects.toBeInstanceOf(NotFoundError);
  });
});
