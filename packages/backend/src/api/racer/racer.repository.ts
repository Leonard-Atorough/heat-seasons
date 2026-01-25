import { Racer } from "@shared/index";
import { StorageAdapter } from "../../storage/";
import { IRacerRepository } from "./racer.repository.interface.js";

export class RacerRepository implements IRacerRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { active?: boolean; racerIds?: string[] }): Promise<Racer[]> {
    try {
      const response = await this.storageAdapter.findAll<Racer>("racers", filters);
      console.log(`RacerRepository.findAll called with filters: ${JSON.stringify(filters)}`);
      const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name));
      console.log("Fetched racers:", sortedResponse);
      return sortedResponse;
    } catch (error) {
      console.error("Error fetching racers:", error);
      throw new Error(
        `Failed to fetch racers with filters ${JSON.stringify(filters)}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async findById(id: string): Promise<Racer | null> {
    throw new Error("Not implemented");
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
