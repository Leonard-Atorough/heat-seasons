import { Race } from "shared";
import { StorageAdapter } from "../../storage/";
import { IRaceRepository } from "./race.repository.interface.js";

export class RaceRepository implements IRaceRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<Race[]> {
    throw new Error("Not implemented");
  }

  async findBySeasonId(seasonId: string): Promise<Race[]> {
    const response = await this.storageAdapter.findAll<Race>("races", { seasonId });
    return response.filter((race) => race.results.length > 0 && race.results !== null);
  }

  async findById(id: string): Promise<Race | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<Race, "id">): Promise<Race> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Race>): Promise<Race> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
