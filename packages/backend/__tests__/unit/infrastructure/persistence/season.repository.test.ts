import { InMemoryStorageAdapter } from "../../../helpers/inMemoryStorageAdapter";
import { RepositoryWriteError } from "../../../../src/Infrastructure/errors";
import { SeasonRepository } from "../../../../src/Infrastructure/persistence/repositories/season.repository";
import { seasons } from "../../../fixtures";

describe("SeasonRepository", () => {
  // 1. Given persisted seasons, when querying by status and active season, then the repository returns mapped season entities.
  // 2. Given a season participant, when adding, listing, and removing it, then the repository works through the generic storage adapter only.
  // 3. Given a write failure, when persisting a season, then the repository wraps it as an infrastructure error and preserves cause.

  it("returns seasons filtered by status and finds the active season", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new SeasonRepository(adapter);

    adapter.seed("seasons", [
      {
        id: "season-active",
        name: "Season Active",
        status: "active",
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: undefined,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: "season-upcoming",
        name: "Season Upcoming",
        status: "upcoming",
        startDate: new Date("2026-06-01T00:00:00.000Z"),
        endDate: undefined,
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ]);

    const activeSeasons = await repository.findAll({ status: "active" });
    const activeSeason = await repository.findActive();

    expect(activeSeasons).toHaveLength(1);
    expect(activeSeasons[0]).toEqual(
      expect.objectContaining({
        id: "season-active",
        status: "active",
      }),
    );
    expect(activeSeason).toEqual(
      expect.objectContaining({
        id: "season-active",
        status: "active",
      }),
    );
  });

  it("adds, finds, and removes participants through the storage adapter", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new SeasonRepository(adapter);

    const participant = await repository.addParticipant("season-1", "racer-1");
    const participantsAfterAdd = await repository.findParticipants("season-1");

    expect(participant).toEqual(
      expect.objectContaining({
        seasonId: "season-1",
        racerId: "racer-1",
      }),
    );
    expect(participantsAfterAdd).toEqual([
      expect.objectContaining({
        seasonId: "season-1",
        racerId: "racer-1",
      }),
    ]);

    await repository.removeParticipant("season-1", "racer-1");

    expect(await repository.findParticipants("season-1")).toEqual([]);
  });

  it("wraps season write failures as repository infrastructure errors", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new SeasonRepository(adapter);
    const season = seasons.active({ id: "season-write-failure" });
    const rootCause = new Error("sqlite is locked");

    jest.spyOn(adapter, "create").mockRejectedValueOnce(rootCause);

    let thrownError: unknown;

    try {
      await repository.create(season as any);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(RepositoryWriteError);
    expect((thrownError as RepositoryWriteError).cause).toBe(rootCause);
  });
});
