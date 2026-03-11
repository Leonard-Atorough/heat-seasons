import { RacerEntity } from "src/domain/entities";
import { StorageAdapter } from "../StorageAdapter";
import { IRacerRepository } from "src/domain/repositories";
import { RacerMapper } from "src/application/mappers";
import { wrapWriteFailure } from "./repositoryWriteFailure";

export class RacerRepository implements IRacerRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { active?: boolean }): Promise<RacerEntity[]> {
    const response = await this.storageAdapter.findAll<any>("racers", filters);
    const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name));
    return (sortedResponse || []).map((racer) => RacerMapper.toDomainFromPersistence(racer));
  }

  async findById(id: string): Promise<RacerEntity | null> {
    const racer = await this.storageAdapter.findById<any>("racers", id);
    return racer ? RacerMapper.toDomainFromPersistence(racer) : null;
  }

  async findByUserId(userId: string): Promise<RacerEntity | null> {
    const racers = await this.storageAdapter.findAll<any>("racers", { userId });
    return racers.length > 0 ? RacerMapper.toDomainFromPersistence(racers[0]) : null;
  }

  async findByIds(ids: string[]): Promise<RacerEntity[]> {
    const allRacers = await this.storageAdapter.findAll<any>("racers");
    const filtered = allRacers.filter((racer) => ids.includes(racer.id)) || [];
    return filtered.map((racer) => RacerMapper.toDomainFromPersistence(racer));
  }

  async create(entity: RacerEntity): Promise<RacerEntity> {
    // Repository assigns ID and timestamps (infrastructure concern)
    const dataToSave = {
      ...RacerMapper.toPersistence(entity),
    };

    try {
      const saved = await this.storageAdapter.create("racers", dataToSave);
      return RacerMapper.toDomainFromPersistence(saved);
    } catch (error) {
      throw wrapWriteFailure("Failed to create racer", { operation: "createRacer" }, error);
    }
  }

  async update(id: string, entity: RacerEntity): Promise<RacerEntity> {
    const dataToUpdate = {
      ...RacerMapper.toPersistence(entity),
    };

    try {
      const updated = await this.storageAdapter.update("racers", id, dataToUpdate);
      return RacerMapper.toDomainFromPersistence(updated);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to update racer",
        { operation: "updateRacer", racerId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.storageAdapter.delete("racers", id);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to delete racer",
        { operation: "deleteRacer", racerId: id },
        error,
      );
    }
  }
}
