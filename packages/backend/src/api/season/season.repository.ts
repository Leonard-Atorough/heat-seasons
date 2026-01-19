import { StorageAdapter } from "../../storage/";
import { ISeasonRepository } from "./season.repository.interface.js";
import { SeasonStatus } from "shared";
import { SeasonDTO } from "src/models";

export class SeasonRepository implements ISeasonRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { status?: SeasonStatus }): Promise<SeasonDTO[]> {
    try {
      const seasons = await this.storageAdapter.findAll<SeasonDTO>("seasons");
      if (filters?.status) {
        return seasons.filter((season) => season.status === filters.status);
      }
      return seasons;
    } catch (error) {
      throw new Error("Failed to retrieve seasons");
    }
  }

  async findById(id: string): Promise<SeasonDTO | null> {
    throw new Error("Not implemented");
  }

  async findActive(): Promise<SeasonDTO | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<SeasonDTO, "id">): Promise<SeasonDTO> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<SeasonDTO>): Promise<SeasonDTO> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
