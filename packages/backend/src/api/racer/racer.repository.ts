import { Racer } from "shared";
import { StorageAdapter } from "../../storage/";
import { IRacerRepository } from "./racer.repository.interface.js";

export class RacerRepository implements IRacerRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { active?: boolean }): Promise<Racer[]> {
    const response = await this.storageAdapter.findAll<Racer>("racers", filters);
    const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name));
    return sortedResponse || [];
  }

  async findById(id: string): Promise<Racer | null> {
    throw new Error("Not implemented");
  }

  async findByIds(ids: string[]): Promise<Racer[]> {
    const allRacers = await this.storageAdapter.findAll<Racer>("racers");
    return allRacers.filter((racer) => ids.includes(racer.id)) || [];
  }

  async create(data: Omit<Racer, "id">): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Racer>): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
