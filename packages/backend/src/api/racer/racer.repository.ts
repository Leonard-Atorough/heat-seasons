import { RacerEntity } from "src/domain/entities/RacerEntity";
import { StorageAdapter } from "src/Infrastructure/persistence/";
import { IRacerRepository } from "src/domain/repositories/racer.repository.interface";
import { RacerMapper } from "@src/application/mappers/racerMapper";
import { randomUUID } from "crypto";

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

  async findByIds(ids: string[]): Promise<RacerEntity[]> {
    const allRacers = await this.storageAdapter.findAll<any>("racers");
    const filtered = allRacers.filter((racer) => ids.includes(racer.id)) || [];
    return filtered.map((racer) => RacerMapper.toDomainFromPersistence(racer));
  }

  async create(entity: RacerEntity): Promise<RacerEntity> {
    // Repository assigns ID and timestamps (infrastructure concern)
    const dataToSave = {
      ...RacerMapper.toPersistence(entity),
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.storageAdapter.create("racers", dataToSave);
    return RacerMapper.toDomainFromPersistence(saved);
  }

  async update(id: string, entity: RacerEntity): Promise<RacerEntity> {
    const dataToUpdate = {
      ...RacerMapper.toPersistence(entity),
      updatedAt: new Date(),
    };

    const updated = await this.storageAdapter.update("racers", id, dataToUpdate);
    return RacerMapper.toDomainFromPersistence(updated);
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
