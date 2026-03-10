import { SeasonEntity } from "src/domain/entities";
import { StorageAdapter } from "../StorageAdapter";
import { ISeasonRepository } from "src/domain/repositories";
import { SeasonStatus, SeasonParticipant } from "shared";
import { SeasonMapper } from "src/application/mappers";

interface PersistedSeasonParticipant {
  id: string;
  seasonId: string;
  racerId: string;
  registeredAt: Date;
}

export class SeasonRepository implements ISeasonRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { status?: SeasonStatus }): Promise<SeasonEntity[]> {
    try {
      const seasons = await this.storageAdapter.findAll<any>("seasons");
      if (filters?.status) {
        return seasons
          .filter((season) => season.status === filters.status)
          .map((season) => SeasonMapper.toDomainFromPersistence(season));
      }
      return seasons.map((season) => SeasonMapper.toDomainFromPersistence(season));
    } catch (error) {
      throw new Error("Failed to retrieve seasons");
    }
  }

  async findById(id: string): Promise<SeasonEntity | null> {
    const season = await this.storageAdapter.findById<any>("seasons", id);
    return season ? SeasonMapper.toDomainFromPersistence(season) : null;
  }

  async findActive(): Promise<SeasonEntity | null> {
    const seasons = await this.storageAdapter.findAll<any>("seasons");
    const season = seasons.find((season) => season.status === "active");
    return season ? SeasonMapper.toDomainFromPersistence(season) : null;
  }

  async create(data: SeasonEntity): Promise<SeasonEntity> {
    const dataToSave = {
      ...SeasonMapper.toPersistence(data),
    };
    const savedData = await this.storageAdapter.create("seasons", dataToSave);
    return SeasonMapper.toDomainFromPersistence(savedData);
  }

  async update(id: string, data: SeasonEntity): Promise<SeasonEntity> {
    const dataToUpdate = {
      ...SeasonMapper.toPersistence(data),
    };
    const updatedData = await this.storageAdapter.update("seasons", id, dataToUpdate);
    return SeasonMapper.toDomainFromPersistence(updatedData);
  }

  async delete(id: string): Promise<void> {
    await this.storageAdapter.delete("seasons", id);
  }

  async addParticipant(seasonId: string, racerId: string): Promise<SeasonParticipant> {
    const result = await this.storageAdapter.create<PersistedSeasonParticipant>(
      "seasonParticipants",
      { seasonId, racerId, registeredAt: new Date() },
    );

    return {
      seasonId: result.seasonId,
      racerId: result.racerId,
      registeredAt: result.registeredAt,
    };
  }

  async removeParticipant(seasonId: string, racerId: string): Promise<void> {
    const participant = await this.findParticipantRecord(seasonId, racerId);

    if (!participant) {
      throw new Error("Season participant not found");
    }

    await this.storageAdapter.delete("seasonParticipants", participant.id);
  }

  async findParticipants(seasonId: string): Promise<SeasonParticipant[]> {
    const results = await this.storageAdapter.findAll<PersistedSeasonParticipant>(
      "seasonParticipants",
      { seasonId },
    );

    return results.map((r) => ({
      seasonId: r.seasonId,
      racerId: r.racerId,
      registeredAt: r.registeredAt,
    }));
  }

  private async findParticipantRecord(
    seasonId: string,
    racerId: string,
  ): Promise<PersistedSeasonParticipant | null> {
    const participants = await this.storageAdapter.findAll<PersistedSeasonParticipant>(
      "seasonParticipants",
      { seasonId, racerId },
    );

    return participants[0] ?? null;
  }
}
