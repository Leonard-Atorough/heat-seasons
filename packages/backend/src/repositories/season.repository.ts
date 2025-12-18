import { Season } from "../services/season.service.js";
import { SeasonStatus } from "shared";

export class SeasonRepository {
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

export default new SeasonRepository();
