import { races } from "../../../fixtures";
import { InMemoryStorageAdapter } from "../../../helpers/inMemoryStorageAdapter";
import { RepositoryWriteError } from "../../../../src/Infrastructure/errors";
import { RaceRepository } from "../../../../src/Infrastructure/persistence/repositories/race.repository";

describe("RaceRepository", () => {
  it("wraps race write failures as repository infrastructure errors", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new RaceRepository(adapter);
    const race = races.pending({ id: "race-write-failure" });
    const rootCause = new Error("sqlite is locked");

    jest.spyOn(adapter, "create").mockRejectedValueOnce(rootCause);

    let thrownError: unknown;

    try {
      await repository.create(race as any);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toEqual(
      expect.objectContaining({
        name: "RepositoryWriteError",
        cause: rootCause,
      }),
    );
    expect(thrownError).toBeInstanceOf(RepositoryWriteError);
  });
});