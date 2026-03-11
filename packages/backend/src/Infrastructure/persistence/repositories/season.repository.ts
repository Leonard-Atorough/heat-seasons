import { SeasonEntity } from "../../../domain/entities/index.js";
import { StorageAdapter } from "../StorageAdapter.js";
import { ISeasonRepository } from "../../../domain/repositories/index.js";
import { SeasonStatus, SeasonParticipant } from "shared";
import { SeasonMapper } from "../../../application/mappers/index.js";
import { wrapWriteFailure } from "./repositoryWriteFailure.js";

interface PersistedSeasonParticipant {
  id: string;
  seasonId: string;
  racerId: string;
  registeredAt: Date;
}

export class SeasonRepository implements ISeasonRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { status?: SeasonStatus }): Promise<SeasonEntity[]> {
    const seasons = await this.storageAdapter.findAll<any>("seasons");
    if (filters?.status) {
      return seasons
        .filter((season) => season.status === filters.status)
        .map((season) => SeasonMapper.toDomainFromPersistence(season));
    }
    return seasons.map((season) => SeasonMapper.toDomainFromPersistence(season));
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

    try {
      const savedData = await this.storageAdapter.create("seasons", dataToSave);
      return SeasonMapper.toDomainFromPersistence(savedData);
    } catch (error) {
      throw wrapWriteFailure("Failed to create season", { operation: "create" }, error);
    }
  }

  async update(id: string, data: SeasonEntity): Promise<SeasonEntity> {
    const dataToUpdate = {
      ...SeasonMapper.toPersistence(data),
    };

    try {
      const updatedData = await this.storageAdapter.update("seasons", id, dataToUpdate);
      return SeasonMapper.toDomainFromPersistence(updatedData);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to update season",
        { operation: "update", seasonId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.storageAdapter.delete("seasons", id);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to delete season",
        { operation: "delete", seasonId: id },
        error,
      );
    }
  }

  async addParticipant(seasonId: string, racerId: string): Promise<SeasonParticipant> {
    try {
      const result = await this.storageAdapter.create<PersistedSeasonParticipant>(
        "seasonParticipants",
        { seasonId, racerId, registeredAt: new Date() },
      );

      return {
        seasonId: result.seasonId,
        racerId: result.racerId,
        registeredAt: result.registeredAt,
      };
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to add season participant",
        { operation: "addParticipant", seasonId, racerId },
        error,
      );
    }
  }

  async removeParticipant(seasonId: string, racerId: string): Promise<void> {
    const participant = await this.findParticipantRecord(seasonId, racerId);

    if (!participant) {
      return;
    }

    try {
      await this.storageAdapter.delete("seasonParticipants", participant.id);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to remove season participant",
        { operation: "removeParticipant", seasonId, racerId },
        error,
      );
    }
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
