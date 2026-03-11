import { SeasonCreateInput, SeasonResponse, SeasonUpdateInput } from "../../application/dtos/index.js";
import { ISeasonRepository } from "../../domain/repositories/season.repository.interface.js";
import { ISeasonService } from "./season.service.interface.js";
import { SeasonStatus, SEASON_STATUS, SeasonParticipant } from "shared";
import { SeasonMapper } from "../../application/mappers/index.js";
import {
  ConflictError,
  NotFoundError,
} from "../../domain/errors/index.js";
import { mapWriteFailure } from "../../api/serviceWriteFailure.js";

export class SeasonService implements ISeasonService {
  constructor(private seasonRepository: ISeasonRepository) {}

  async getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]> {
    const seasons = await this.seasonRepository.findAll(filters);
    return seasons.map((season) => SeasonMapper.toResponse(season));
  }

  async getById(id: string): Promise<SeasonResponse> {
    const season = await this.seasonRepository.findById(id);

    if (!season) {
      throw new NotFoundError(`Season with ID ${id} not found`, {
        resource: "season",
        seasonId: id,
      });
    }
    return SeasonMapper.toResponse(season);
  }

  async create(data: SeasonCreateInput): Promise<SeasonResponse> {
    const newSeason = SeasonMapper.toDomain(data);

    try {
      const createdSeason = await this.seasonRepository.create(newSeason);
      return SeasonMapper.toResponse(createdSeason);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to create season",
        { operation: "create", seasonName: data.name },
        error,
      );
    }
  }

  async joinSeason(seasonId: string, racerId: string): Promise<SeasonParticipant> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError(`Season with ID ${seasonId} not found`, {
        resource: "season",
        seasonId,
      });
    }
    const existing = await this.seasonRepository.findParticipants(seasonId);
    if (existing.some((p) => p.racerId === racerId)) {
      throw new ConflictError(`Racer ${racerId} is already registered for season ${seasonId}`, {
        seasonId,
        racerId,
      });
    }

    try {
      return await this.seasonRepository.addParticipant(seasonId, racerId);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to add season participant",
        { operation: "addParticipant", seasonId, racerId },
        error,
      );
    }
  }

  async getParticipants(seasonId: string): Promise<SeasonParticipant[]> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError(`Season with ID ${seasonId} not found`, {
        resource: "season",
        seasonId,
      });
    }
    return this.seasonRepository.findParticipants(seasonId);
  }

  async update(id: string, data: SeasonUpdateInput): Promise<SeasonResponse> {
    const seasonToUpdate = await this.seasonRepository.findById(id);
    if (!seasonToUpdate) {
      throw new NotFoundError(`Season with ID ${id} not found`, {
        resource: "season",
        seasonId: id,
      });
    }

    const updateData = { ...data };
    if (data.status === SEASON_STATUS.COMPLETED && !seasonToUpdate.endDate && !data.endDate) {
      updateData.endDate = new Date();
    }

    seasonToUpdate.update(updateData);

    try {
      const updatedSeason = await this.seasonRepository.update(id, seasonToUpdate);
      return SeasonMapper.toResponse(updatedSeason);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to update season",
        { operation: "update", seasonId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const seasonToDelete = await this.seasonRepository.findById(id);
    if (!seasonToDelete) {
      throw new NotFoundError(`Season with ID ${id} not found`, {
        resource: "season",
        seasonId: id,
      });
    }

    try {
      await this.seasonRepository.delete(id);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to delete season",
        { operation: "delete", seasonId: id },
        error,
      );
    }
  }
}
