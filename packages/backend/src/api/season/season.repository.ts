import { SeasonEntity } from "src/domain/entities/SeasonEntity";
import { StorageAdapter } from "../../storage/";
import { ISeasonRepository } from "./season.repository.interface.js";
import { SeasonStatus } from "shared";
import { SeasonMapper } from "src/application/mappers/seasonMapper";

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
      createdAt: new Date(),
      updatedAt: new Date(),
      // ID will be assigned by the storage adapter
    };
    const savedData = await this.storageAdapter.create("seasons", dataToSave);
    return SeasonMapper.toDomainFromPersistence(savedData);
  }

  async update(id: string, data: SeasonEntity): Promise<SeasonEntity> {
    const dataToUpdate = {
      ...SeasonMapper.toPersistence(data),
      updatedAt: new Date(),
    };
    const updatedData = await this.storageAdapter.update("seasons", id, dataToUpdate);
    return SeasonMapper.toDomainFromPersistence(updatedData);
  }

  async delete(id: string): Promise<void> {
    await this.storageAdapter.delete("seasons", id);
  }
}
