import { racers } from "../../../fixtures";
import { InMemoryStorageAdapter } from "../../../helpers/inMemoryStorageAdapter";
import { RepositoryWriteError } from "../../../../src/Infrastructure/errors";
import { RacerRepository } from "../../../../src/Infrastructure/persistence/repositories/racer.repository";

describe("RacerRepository", () => {
  it("wraps racer write failures as repository infrastructure errors", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new RacerRepository(adapter);
    const racer = racers.standard({ id: "racer-write-failure" });
    const rootCause = new Error("sqlite is locked");

    jest.spyOn(adapter, "create").mockRejectedValueOnce(rootCause);

    await expect(repository.create(racer as any)).rejects.toEqual(
      expect.objectContaining({
        name: "RepositoryWriteError",
        cause: rootCause,
      }),
    );
    await expect(repository.create(racer as any)).rejects.toBeInstanceOf(RepositoryWriteError);
  });
});