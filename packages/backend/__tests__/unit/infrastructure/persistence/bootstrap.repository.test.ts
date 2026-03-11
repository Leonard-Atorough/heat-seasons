import { BootstrapEntity } from "../../../../src/domain/entities";
import { InMemoryStorageAdapter } from "../../../helpers/inMemoryStorageAdapter";
import { RepositoryWriteError } from "../../../../src/Infrastructure/errors";
import { BootstrapRepository } from "../../../../src/Infrastructure/persistence/repositories/bootstrap.repository";

describe("BootstrapRepository", () => {
  it("wraps bootstrap write failures as repository infrastructure errors", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new BootstrapRepository(adapter);
    const config = BootstrapEntity.create({
      bootstrapTokenHash: "hash",
      bootstrapTokenExpiresAt: new Date("2026-06-01T00:00:00.000Z"),
      isInitialized: false,
    });
    const rootCause = new Error("sqlite is locked");

    jest.spyOn(adapter, "create").mockRejectedValueOnce(rootCause);

    await expect(repository.upsertBootstrapConfig(config)).rejects.toEqual(
      expect.objectContaining({
        name: "RepositoryWriteError",
        cause: rootCause,
      }),
    );
    await expect(repository.upsertBootstrapConfig(config)).rejects.toBeInstanceOf(
      RepositoryWriteError,
    );
  });
});