import { ISeasonRepository } from "./season.repository.interface.js";
import { ISeasonService } from "./season.service.interface.js";
import { SeasonStatus } from "shared";

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: SeasonStatus;
}

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<Season[]> {
    throw new Error("Not implemented");
  }

  async getById(id: string): Promise<Season | null> {
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

  async getActiveSeason(): Promise<Season | null> {
    throw new Error("Not implemented");
  }
}
