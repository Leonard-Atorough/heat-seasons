import { NotFoundError } from "src/errors/appError.js";
import { SeasonCreateInput, SeasonResponse, SeasonUpdateInput } from "../../models";
import { ISeasonRepository } from "./season.repository.interface.js";
import { ISeasonService } from "./season.service.interface.js";
import { SeasonStatus } from "shared";
import { SeasonMapper } from "@src/application/mappers/SeasonMapper";

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]> {
    const seasons = await this.seasonRepository.findAll(filters);

    if (!seasons) {
      throw new NotFoundError("No seasons found");
    }
    return seasons.map((season) => SeasonMapper.toResponse(season));
  }

  async getById(id: string): Promise<SeasonResponse> {
    const season = await this.seasonRepository.findById(id);

    if (!season) {
      throw new NotFoundError(`Season with ID ${id} not found`);
    }
    return SeasonMapper.toResponse(season);
  }

  async getActiveSeason(): Promise<SeasonResponse> {
    const season = await this.seasonRepository.findActive();

    if (!season) {
      throw new NotFoundError("No active season found");
    }
    return SeasonMapper.toResponse(season);
  }

  async create(data: SeasonCreateInput): Promise<SeasonResponse> {
    const newSeason = SeasonMapper.toDomain(data);
    const createdSeason = await this.seasonRepository.create(newSeason);
    return SeasonMapper.toResponse(createdSeason);
  }

  async update(id: string, data: SeasonUpdateInput): Promise<SeasonResponse> {
    const seasonToUpdate = await this.seasonRepository.findById(id);
    if (!seasonToUpdate) {
      throw new NotFoundError(`Season with ID ${id} not found`);
    }

    seasonToUpdate.update({ ...data });

    const updatedSeason = await this.seasonRepository.update(id, seasonToUpdate);
    return SeasonMapper.toResponse(updatedSeason);
  }

  async delete(id: string): Promise<void> {
    const seasonToDelete = await this.seasonRepository.findById(id);
    if (!seasonToDelete) {
      throw new NotFoundError(`Season with ID ${id} not found`);
    }
    await this.seasonRepository.delete(id);
  }
}
