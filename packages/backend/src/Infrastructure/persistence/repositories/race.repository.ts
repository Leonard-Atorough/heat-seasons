import { StorageAdapter } from "../StorageAdapter";
import { IRaceRepository } from "src/domain/repositories";
import { RaceEntity } from "src/domain/entities";
import { RaceMapper } from "src/application/mappers";
import { wrapWriteFailure } from "./repositoryWriteFailure";

export class RaceRepository implements IRaceRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<RaceEntity[]> {
    const response = await this.storageAdapter.findAll<any>("races");
    return (response || []).map((response) => RaceMapper.toDomainFromPersistence(response));
  }

  async findBySeasonId(seasonId: string): Promise<RaceEntity[]> {
    const response = await this.storageAdapter.findAll<any>("races", { seasonId });
    return (response || []).map((response) => RaceMapper.toDomainFromPersistence(response));
  }

  async findById(id: string): Promise<RaceEntity | null> {
    const response = await this.storageAdapter.findById<any>("races", id);
    return response ? RaceMapper.toDomainFromPersistence(response) : null;
  }

  async create(data: RaceEntity): Promise<RaceEntity> {
    const dataToSave = {
      ...RaceMapper.toPersistence(data),
    };
    try {
      const response = await this.storageAdapter.create("races", dataToSave);
      return RaceMapper.toDomainFromPersistence(response);
    } catch (error) {
      throw wrapWriteFailure("Failed to create race", { operation: "createRace" }, error);
    }
  }

  async update(id: string, data: RaceEntity): Promise<RaceEntity> {
    const dataToUpdate = {
      ...RaceMapper.toPersistence(data),
    };
    try {
      const response = await this.storageAdapter.update("races", id, dataToUpdate);
      return RaceMapper.toDomainFromPersistence(response);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to update race",
        { operation: "updateRace", raceId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      return;
    }
    try {
      await this.storageAdapter.delete("races", id);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to delete race",
        { operation: "deleteRace", raceId: id },
        error,
      );
    }
  }
}
