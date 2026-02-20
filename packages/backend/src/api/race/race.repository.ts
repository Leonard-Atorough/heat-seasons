import { StorageAdapter } from "src/Infrastructure/persistence/";
import { IRaceRepository } from "src/domain/repositories/race.repository.interface";
import { RaceEntity } from "src/domain/entities/RaceEntity";
import { RaceMapper } from "src/application/mappers/raceMapper";

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const response = await this.storageAdapter.create("races", dataToSave);
    return RaceMapper.toDomainFromPersistence(response);
  }

  async update(id: string, data: RaceEntity): Promise<RaceEntity> {
    const dataToUpdate = {
      ...RaceMapper.toPersistence(data),
      updatedAt: new Date(),
    };
    const response = await this.storageAdapter.update("races", id, dataToUpdate);
    return RaceMapper.toDomainFromPersistence(response);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      return;
    }
    await this.storageAdapter.delete("races", id);
  }
}
