import { RacerDTO, RacerResponse } from "../../models";
import { StorageAdapter } from "../../storage/";
import { IRacerRepository } from "./racer.repository.interface.js";

export class RacerRepository implements IRacerRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { active?: boolean }): Promise<RacerDTO[]> {
    try {
      const response = await this.storageAdapter.findAll<RacerDTO>("racers", filters);
      const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name));
      return sortedResponse;
    } catch (error) {
      console.error("Error fetching racers:", error);
      throw new Error(
        `Failed to fetch racers with filters ${JSON.stringify(filters)}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findById(id: string): Promise<RacerDTO | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<RacerDTO, "id">): Promise<RacerDTO> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<RacerDTO>): Promise<RacerDTO> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
