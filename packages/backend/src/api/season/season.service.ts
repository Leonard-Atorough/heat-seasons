import {
  SeasonCreateInput,
  SeasonDTO,
  SeasonResponse,
  SeasonUpdateInput,
} from "../../models/season.model.js";
import { ISeasonRepository } from "./season.repository.interface.js";
import { ISeasonService } from "./season.service.interface.js";
import { SeasonStatus } from "shared";

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]> {
    const seasons = await this.seasonRepository.findAll(filters);
    return this.mapDTOToSeason(seasons);
  }

  async getById(id: string): Promise<SeasonResponse | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<SeasonCreateInput, "id">): Promise<SeasonResponse> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<SeasonUpdateInput>): Promise<SeasonResponse> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getActiveSeason(): Promise<SeasonResponse | null> {
    throw new Error("Not implemented");
  }

  private mapDTOToSeason(dtos: SeasonDTO[]): SeasonResponse[] {
    return dtos.map((dto) => ({
      id: dto.id,
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status,
    }));
  }
}
