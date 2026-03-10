import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { NotFoundError } from "../../../src/Infrastructure/errors/appError";
import { RacerCreateInput } from "../../../src/application/dtos/racer.dto";
import { racers, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";

interface PersistedRacerRecord extends Record<string, unknown> {
  id: string;
  name: string;
  active: boolean;
  team: string;
  teamColor: string;
  nationality: string;
  age: number;
  joinDate?: Date;
  userId?: string;
  badgeUrl?: string;
  profileUrl?: string;
}

interface PersistedUserRecord extends Record<string, unknown> {
  id: string;
  googleId: string;
  email: string;
  name: string;
  role: string;
  racerId?: string;
  profilePicture?: string;
  lastLoginAt?: Date;
  loginCount: number;
}

describe("RacerService", () => {
  // 1. Given persisted racers, when listing or fetching racers, then the service returns response models with `stats: null` and respects filters.
  // 2. Given a create request without a user assignment, when creating a racer, then the service persists and returns an unassigned racer.
  // 3. Given a create request with a valid user assignment, when creating a racer, then the service links the new racer to that user.
  // 4. Given a create request with a missing user, when creating a racer, then the service throws a not found error.
  // 5. Given an existing racer, when updating it, then the service persists the changes; and when the racer is missing, it throws.
  // 6. Given an existing racer, when deleting it, then the service removes it; and when the racer is missing, it throws.

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

  it("lists and fetches racers with null stats and active filtering", async () => {
    const activeRacer = racers.john({ id: "racer-b", active: true });
    const inactiveRacer = racers.inactive({ id: "racer-a", name: "Aaron Inactive" });

    storageAdapter.seed("racers", [{ ...activeRacer }, { ...inactiveRacer }]);

    const racerService = container.getRacerService();

    const activeOnly = await racerService.getAll({ active: true });
    const fetchedById = await racerService.getById(activeRacer.id);
    const fetchedByUserId = await racerService.getByUserId("missing-user");

    expect(activeOnly).toEqual([
      expect.objectContaining({
        id: activeRacer.id,
        name: activeRacer.name,
        active: true,
        stats: null,
      }),
    ]);
    expect(fetchedById).toEqual(
      expect.objectContaining({
        id: activeRacer.id,
        name: activeRacer.name,
        stats: null,
      }),
    );
    expect(fetchedByUserId).toBeNull();
  });

  it("creates an unassigned racer when no userId is provided", async () => {
    const racerService = container.getRacerService();
    const input: RacerCreateInput = {
      name: "Sociable Racer",
      active: true,
      team: "Team Sociable",
      teamColor: "#123456",
      nationality: "Canada",
      age: 27,
      userId: undefined,
      badgeUrl: undefined,
      profileUrl: undefined,
    };

    const createdRacer = await racerService.create(input);
    const persistedRacers = storageAdapter.snapshot<PersistedRacerRecord>("racers");

    expect(createdRacer).toEqual(
      expect.objectContaining({
        name: input.name,
        team: input.team,
        userId: undefined,
      }),
    );
    expect(createdRacer.id).toBeTruthy();
    expect(createdRacer.joinDate).toBeInstanceOf(Date);
    expect(persistedRacers).toHaveLength(1);
    expect(persistedRacers[0]).toEqual(
      expect.objectContaining({
        name: input.name,
        team: input.team,
        userId: undefined,
      }),
    );
  });

  it("creates a racer and links it to the provided user", async () => {
    const persistedUser = users.user({ id: "user-123", racerId: undefined });

    storageAdapter.seed("users", [{ ...persistedUser }]);

    const racerService = container.getRacerService();
    const input: RacerCreateInput = {
      name: "Linked Racer",
      active: true,
      team: "Linked Team",
      teamColor: "#abcdef",
      nationality: "France",
      age: 24,
      userId: persistedUser.id,
      badgeUrl: "https://example.com/badge.png",
      profileUrl: "https://example.com/profile.png",
    };

    const createdRacer = await racerService.create(input);
    const persistedRacers = storageAdapter.snapshot<PersistedRacerRecord>("racers");
    const persistedUsers = storageAdapter.snapshot<PersistedUserRecord>("users");

    expect(createdRacer).toEqual(
      expect.objectContaining({
        name: input.name,
        userId: persistedUser.id,
        badgeUrl: input.badgeUrl,
        profileUrl: input.profileUrl,
      }),
    );
    expect(persistedRacers[0]).toEqual(
      expect.objectContaining({
        id: createdRacer.id,
        userId: persistedUser.id,
      }),
    );
    expect(persistedUsers[0]).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        racerId: createdRacer.id,
      }),
    );
  });

  it("throws when creating a racer for a missing user", async () => {
    const racerService = container.getRacerService();

    await expect(
      racerService.create({
        name: "Ghost Racer",
        active: true,
        team: "Ghost Team",
        teamColor: "#111111",
        nationality: "Nowhere",
        age: 99,
        userId: "missing-user",
        badgeUrl: undefined,
        profileUrl: undefined,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates an existing racer and throws for a missing racer", async () => {
    const persistedRacer = racers.standard({ id: "racer-update-1", name: "Before Update" });

    storageAdapter.seed("racers", [{ ...persistedRacer }]);

    const racerService = container.getRacerService();
    const updatedRacer = await racerService.update(persistedRacer.id, {
      name: "After Update",
      active: false,
      teamColor: "#654321",
    });
    const persistedRacers = storageAdapter.snapshot<PersistedRacerRecord>("racers");

    expect(updatedRacer).toEqual(
      expect.objectContaining({
        id: persistedRacer.id,
        name: "After Update",
        active: false,
        teamColor: "#654321",
      }),
    );
    expect(persistedRacers[0]).toEqual(
      expect.objectContaining({
        id: persistedRacer.id,
        name: "After Update",
        active: false,
        teamColor: "#654321",
      }),
    );

    await expect(racerService.update("missing-racer", { name: "Nope" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("deletes an existing racer and throws for a missing racer", async () => {
    const persistedRacer = racers.standard({ id: "racer-delete-1" });

    storageAdapter.seed("racers", [{ ...persistedRacer }]);

    const racerService = container.getRacerService();

    await racerService.delete(persistedRacer.id);

    expect(await racerService.getById(persistedRacer.id)).toBeNull();
    expect(storageAdapter.snapshot<PersistedRacerRecord>("racers")).toEqual([]);

    await expect(racerService.delete("missing-racer")).rejects.toBeInstanceOf(NotFoundError);
  });
});
