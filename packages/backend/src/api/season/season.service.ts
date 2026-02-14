import { NotFoundError } from "src/errors/appError.js";
import { SeasonCreateInput, SeasonUpdateInput } from "../../models";
import { ISeasonRepository } from "./season.repository.interface.js";
import { ISeasonService } from "./season.service.interface.js";
import { Season, SeasonStatus } from "shared";

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<Season[]> {
    const seasons = await this.seasonRepository.findAll(filters);

    if (!seasons) {
      throw new NotFoundError("No seasons found");
    }
    return seasons;
  }

  async getById(id: string): Promise<Season> {
    throw new Error("Not implemented");
  }

  async create(data: SeasonCreateInput): Promise<Season> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: SeasonUpdateInput): Promise<Season> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getActiveSeason(): Promise<Season> {
    const season = await this.seasonRepository.findActive();

    if (!season) {
      throw new NotFoundError("No active season found");
    }
    return season;
  }
}
