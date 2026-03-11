import { users } from "../../../fixtures";
import { InMemoryStorageAdapter } from "../../../helpers/inMemoryStorageAdapter";
import { RepositoryWriteError } from "../../../../src/Infrastructure/errors";
import { AuthRepository } from "../../../../src/Infrastructure/persistence/repositories/auth.repository";

describe("AuthRepository", () => {
  it("wraps auth write failures as repository infrastructure errors", async () => {
    const adapter = new InMemoryStorageAdapter();
    const repository = new AuthRepository(adapter);
    const user = users.user({ id: "user-write-failure" });
    const rootCause = new Error("sqlite is locked");

    jest.spyOn(adapter, "create").mockRejectedValueOnce(rootCause);

    let thrownError: unknown;

    try {
      await repository.create(user as any);
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
