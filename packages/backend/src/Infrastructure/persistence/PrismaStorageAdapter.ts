import { PrismaClient } from "../../generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { DATABASE_URL } from "../../env";
import { StorageAdapter } from "./StorageAdapter";

/**
 * Maps the generic collection names used throughout the application to
 * the camelCase model accessor names on the Prisma client.
 */
const COLLECTION_MODEL: Record<string, string> = {
  users: "user",
  racers: "racer",
  seasons: "season",
  races: "race",
  blacklistedTokens: "blacklistedToken",
  bootstrapConfig: "bootstrapConfig",
  seasonParticipants: "seasonParticipant",
  raceResult: "raceResult",
};

/**
 * Prisma-based Storage Adapter
 *
 * Implements StorageAdapter using Prisma ORM for type-safe, concurrent-safe
 * persistence. Configured for SQLite (local / Railway volume) but can be
 * switched to PostgreSQL by changing the provider in schema.prisma and
 * updating DATABASE_URL — no application code changes required.
 *
 * Special handling for the "races" collection: results are stored in a
 * separate RaceResult table (relation) but are transparently flattened
 * into/out of the race objects so the rest of the application sees the
 * same shape it always has.
 */
export class PrismaStorageAdapter implements StorageAdapter {
  private client: PrismaClient;

  constructor(client?: PrismaClient) {
    if (client) {
      this.client = client;
    } else {
      const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });
      this.client = new PrismaClient({ adapter });
    }
  }

  async initialize(): Promise<void> {
    await this.client.$connect();
  }

  // ------------------------------------------------------------------ helpers

  /** Returns the Prisma model delegate for a given collection name. */
  private model(collection: string): any {
    const key = COLLECTION_MODEL[collection];
    if (!key) {
      throw new Error(
        `PrismaStorageAdapter: unknown collection "${collection}". ` +
          `Add it to COLLECTION_MODEL.`,
      );
    }
    return (this.client as any)[key];
  }

  /** Strips undefined values so Prisma doesn't receive explicit undefined fields. */
  private clean(data: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  }

  /**
   * Strips Prisma-internal field (raceId) from a RaceResult row so that
   * the entity / mapper layers see only the domain fields they expect.
   */
  private stripResultMeta({ raceId: _raceId, ...rest }: any): any {
    return rest;
  }

  /**
   * Prepares a RaceResult for writing to Prisma createMany/updateMany by removing
   * any domain-layer-generated fields and undefined values.
   */
  private cleanResultForWrite(r: any): Record<string, unknown> {
    const { id: _id, raceId: _raceId, ...rest } = r;
    return this.clean(rest);
  }

  /**
   * Converts a Prisma Race row (with included RaceResult[]) to the flat shape
   * the rest of the application expects.
   */
  private flattenRace(race: any): any {
    const { results, ...rest } = race;
    return {
      ...rest,
      results: (results ?? []).map((r: any) => this.stripResultMeta(r)),
    };
  }

  // --------------------------------------------------------------- StorageAdapter

  async findById<T>(collection: string, id: string): Promise<T | null> {
    if (collection === "seasonParticipants") {
      const where = this.parseSeasonParticipantId(id);
      const participant = await this.client.seasonParticipant.findUnique({ where });
      return participant ? ({ ...participant, id } as T) : null;
    }

    if (collection === "races") {
      const race = await this.client.race.findUnique({
        where: { id },
        include: { results: true },
      });
      return race ? (this.flattenRace(race) as T) : null;
    }

    return this.model(collection).findUnique({ where: { id } }) as Promise<T | null>;
  }

  async findAll<T>(collection: string, filter?: Record<string, unknown>): Promise<T[]> {
    if (collection === "seasonParticipants") {
      const participants = await this.client.seasonParticipant.findMany({
        where: filter ?? {},
      });
      return participants.map((participant) => ({
        ...participant,
        id: this.buildSeasonParticipantId(participant.seasonId, participant.racerId),
      })) as T[];
    }

    if (collection === "races") {
      const races = await this.client.race.findMany({
        where: filter,
        include: { results: true },
      });
      return races.map((r) => this.flattenRace(r)) as T[];
    }

    return this.model(collection).findMany({ where: filter ?? {} }) as Promise<T[]>;
  }

  async create<T>(collection: string, data: Omit<T, "id">): Promise<T> {
    const { id, results, ...rest } = data as any;
    const cleanRest = this.clean(rest);

    if (collection === "seasonParticipants") {
      const participant = await this.client.seasonParticipant.create({
        data: cleanRest as any,
      });
      return {
        ...participant,
        id: this.buildSeasonParticipantId(participant.seasonId, participant.racerId),
      } as T;
    }

    if (collection === "races") {
      const race = await this.client.race.create({
        data: {
          ...cleanRest,
          ...(id ? { id } : {}),
          ...(results?.length
            ? {
                results: {
                  createMany: { data: results.map((r: any) => this.cleanResultForWrite(r)) },
                },
              }
            : {}),
        } as any,
        include: { results: true },
      });
      return this.flattenRace(race) as T;
    }

    return this.model(collection).create({
      data: { ...cleanRest, ...(id ? { id } : {}) } as any,
    }) as Promise<T>;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    const { id: _id, results, ...rest } = data as any;
    const cleanRest = this.clean(rest);

    if (collection === "races") {
      const race = await this.client.race.update({
        where: { id },
        data: {
          ...cleanRest,
          ...(results
            ? {
                results: {
                  deleteMany: {},
                  createMany: { data: results.map((r: any) => this.cleanResultForWrite(r)) },
                },
              }
            : {}),
        } as any,
        include: { results: true },
      });
      return this.flattenRace(race) as T;
    }

    return this.model(collection).update({ where: { id }, data: cleanRest as any }) as Promise<T>;
  }

  async delete(collection: string, id: string): Promise<void> {
    if (collection === "seasonParticipants") {
      await this.client.seasonParticipant.delete({
        where: this.parseSeasonParticipantId(id),
      });
      return;
    }

    await this.model(collection).delete({ where: { id } });
  }

  async exists(collection: string, id: string): Promise<boolean> {
    if (collection === "seasonParticipants") {
      const where = this.parseSeasonParticipantId(id);
      const participant = await this.client.seasonParticipant.findUnique({
        where,
        select: { seasonId: true, racerId: true },
      });
      return participant !== null;
    }

    const record = await this.model(collection).findUnique({
      where: { id },
      select: { id: true },
    });
    return record !== null;
  }

  async count(collection: string, filter?: Record<string, unknown>): Promise<number> {
    return this.model(collection).count({ where: filter ?? {} });
  }

  getClient(): PrismaClient {
    return this.client;
  }

  private buildSeasonParticipantId(seasonId: string, racerId: string): string {
    return `${seasonId}:${racerId}`;
  }

  private parseSeasonParticipantId(id: string): {
    seasonId_racerId: {
      seasonId: string;
      racerId: string;
    };
  } {
    const [seasonId, racerId] = id.split(":");

    if (!seasonId || !racerId) {
      throw new Error(`Invalid season participant id: ${id}`);
    }

    return {
      seasonId_racerId: {
        seasonId,
        racerId,
      },
    };
  }
}
