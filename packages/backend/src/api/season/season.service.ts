import { ConflictError, NotFoundError } from "src/Infrastructure/errors/appError.js";
import { SeasonCreateInput, SeasonResponse, SeasonUpdateInput } from "src/application/dtos";
import { ISeasonRepository } from "src/domain/repositories/season.repository.interface";
import { ISeasonService } from "./season.service.interface.js";
import { SeasonStatus, SEASON_STATUS, SeasonParticipant } from "shared";
import { SeasonMapper } from "src/application/mappers";

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]> {
    const seasons = await this.seasonRepository.findAll(filters);

    if (!seasons || seasons.length === 0) {
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

  async create(data: SeasonCreateInput): Promise<SeasonResponse> {
    const newSeason = SeasonMapper.toDomain(data);
    const createdSeason = await this.seasonRepository.create(newSeason);
    return SeasonMapper.toResponse(createdSeason);
  }

  async joinSeason(seasonId: string, racerId: string): Promise<SeasonParticipant> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError(`Season with ID ${seasonId} not found`);
    }
    const existing = await this.seasonRepository.findParticipants(seasonId);
    if (existing.some((p) => p.racerId === racerId)) {
      throw new ConflictError(`Racer ${racerId} is already registered for season ${seasonId}`);
    }
    return this.seasonRepository.addParticipant(seasonId, racerId);
  }

  async getParticipants(seasonId: string): Promise<SeasonParticipant[]> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError(`Season with ID ${seasonId} not found`);
    }
    return this.seasonRepository.findParticipants(seasonId);
  }

  async update(id: string, data: SeasonUpdateInput): Promise<SeasonResponse> {
    const seasonToUpdate = await this.seasonRepository.findById(id);
    if (!seasonToUpdate) {
      throw new NotFoundError(`Season with ID ${id} not found`);
    }

    const updateData = { ...data };
    if (data.status === SEASON_STATUS.COMPLETED && !seasonToUpdate.endDate && !data.endDate) {
      updateData.endDate = new Date();
    }

    seasonToUpdate.update(updateData);

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
