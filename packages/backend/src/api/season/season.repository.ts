import { StorageAdapter } from "../../storage/";
import { Season } from "./season.service.js";
import { ISeasonRepository } from "./season.repository.interface.js";
import { SeasonStatus } from "shared";

export class SeasonRepository implements ISeasonRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(filters?: { status?: SeasonStatus }): Promise<Season[]> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<Season | null> {
    throw new Error("Not implemented");
  }

  async findActive(): Promise<Season | null> {
    throw new Error("Not implemented");
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
