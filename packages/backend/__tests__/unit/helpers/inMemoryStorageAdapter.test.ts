import { InMemoryStorageAdapter } from "../../helpers/inMemoryStorageAdapter";

interface RacerRecord {
  id: string;
  name: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

describe("InMemoryStorageAdapter", () => {
  // 1. Given seeded records, when reading them back, then the adapter returns matching data without leaking mutable references.
  // 2. Given a new record, when creating and updating it, then the adapter assigns identity and timestamps and persists changes.
  // 3. Given a persisted record, when deleting it, then the adapter removes it and updates existence and count checks.
  // 4. Given season participants, when using the fake client, then the adapter supports create, query, and delete flows used by the season repository.

  it("returns seeded records without leaking mutable references", async () => {
    const adapter = new InMemoryStorageAdapter();
    const createdAt = new Date("2026-03-10T12:00:00.000Z");

    adapter.seed("users", [
      {
        id: "user-1",
        email: "alice@example.com",
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    const records = await adapter.findAll<{
      id: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    }>("users");

    records[0].email = "changed@example.com";
    records[0].createdAt.setUTCFullYear(2030);

    const persistedRecord = await adapter.findById<{
      id: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    }>("users", "user-1");

    expect(persistedRecord).toEqual({
      id: "user-1",
      email: "alice@example.com",
      createdAt,
      updatedAt: createdAt,
    });
  });

  it("assigns ids and timestamps and persists updates", async () => {
    const adapter = new InMemoryStorageAdapter();

    const created = await adapter.create<RacerRecord>("racers", {
      name: "Max Velocity",
      active: true,
    });

    const updated = await adapter.update<RacerRecord>("racers", created.id, {
      active: false,
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
    const createdUpdatedAt = created.updatedAt as Date;
    const updatedUpdatedAt = updated.updatedAt as Date;
    expect(updated).toEqual(
      expect.objectContaining({
        id: created.id,
        name: "Max Velocity",
        active: false,
      }),
    );
    expect(updatedUpdatedAt.getTime()).toBeGreaterThanOrEqual(createdUpdatedAt.getTime());
  });

  it("deletes records and updates existence checks", async () => {
    const adapter = new InMemoryStorageAdapter();

    adapter.seed("bootstrapConfig", [
      {
        id: "config-1",
        initialized: true,
      },
    ]);

    expect(await adapter.exists("bootstrapConfig", "config-1")).toBe(true);
    expect(await adapter.count("bootstrapConfig")).toBe(1);

    await adapter.delete("bootstrapConfig", "config-1");

    expect(await adapter.exists("bootstrapConfig", "config-1")).toBe(false);
    expect(await adapter.count("bootstrapConfig")).toBe(0);
  });

  it("supports season participant operations through the fake client", async () => {
    const adapter = new InMemoryStorageAdapter();
    const participant = await adapter.create<{
      id: string;
      seasonId: string;
      racerId: string;
      registeredAt?: Date;
    }>("seasonParticipants", {
      seasonId: "season-1",
      racerId: "racer-1",
    });

    const participants = await adapter.findAll<{
      id: string;
      seasonId: string;
      racerId: string;
      registeredAt: Date;
    }>("seasonParticipants", { seasonId: "season-1" });

    expect(participant).toEqual(
      expect.objectContaining({
        id: "season-1:racer-1",
        seasonId: "season-1",
        racerId: "racer-1",
      }),
    );
    expect(participants).toHaveLength(1);

    await adapter.delete("seasonParticipants", participant.id);

    expect(await adapter.findAll("seasonParticipants", { seasonId: "season-1" })).toHaveLength(0);
  });
});