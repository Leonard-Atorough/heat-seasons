import { StorageAdapter } from "../../storage/";
import { ISeasonRepository } from "./season.repository.interface.js";
import { Season, SeasonStatus } from "@shared/index";

export class SeasonRepository implements ISeasonRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { status?: SeasonStatus }): Promise<Season[]> {
    try {
      const seasons = await this.storageAdapter.findAll<Season>("seasons");
      if (filters?.status) {
        return seasons.filter((season) => season.status === filters.status);
      }
      return seasons;
    } catch (error) {
      throw new Error("Failed to retrieve seasons");
    }
  }

  async findById(id: string): Promise<Season> {
    throw new Error("Not implemented");
  }

  async findActive(): Promise<Season | null> {
    const seasons = await this.storageAdapter.findAll<Season>("seasons");
    const season = seasons.find((season) => season.status === "active");
    return season || null;
  }

  async create(data: Omit<Season, "id">): Promise<Season> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Season>): Promise<Season> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
