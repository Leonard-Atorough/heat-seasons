import { IRaceService } from "./race.service.interface.js";
import { RaceCreateInput, RaceResponse, RaceUpdateInput } from "../../application/dtos/index.js";
import { ISeasonRepository, IRaceRepository } from "../../domain/repositories/index.js";
import { RaceMapper } from "../../application/mappers/index.js";
import { RaceEntity } from "../../domain/entities/index.js";
import { NotFoundError, NotImplemented } from "../../domain/errors/index.js";
import { mapWriteFailure } from "../../api/serviceWriteFailure.js";

export class RaceService implements IRaceService {
  constructor(
    private raceRepository: IRaceRepository,
    private seasonRepository: ISeasonRepository,
  ) {}

  async getBySeasonId(seasonId: string): Promise<RaceResponse[]> {
    const racesData = await this.raceRepository.findBySeasonId(seasonId);
    return racesData.map((race) => RaceMapper.toResponse(race));
  }

  async getById(id: string): Promise<RaceResponse> {
    const raceData = await this.raceRepository.findById(id);
    if (!raceData) {
      throw new NotFoundError(`Race with ID ${id} not found`, { resource: "race", raceId: id });
    }
    return RaceMapper.toResponse(raceData as RaceEntity);
  }

  async create(seasonId: string, data: RaceCreateInput): Promise<RaceResponse> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError("Season not found", { resource: "season", seasonId });
    }

    const existing = await this.raceRepository.findBySeasonId(seasonId);
    const raceNumber = existing.length + 1;

    const raceToCreate = RaceMapper.toDomain({ ...data, seasonId, raceNumber });

    try {
      const createdRaceEntity = await this.raceRepository.create(raceToCreate);
      return RaceMapper.toResponse(createdRaceEntity);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to create race",
        { operation: "createRace", seasonId },
        error,
      );
    }
  }

  async update(id: string, data: RaceUpdateInput): Promise<RaceResponse> {
    const existing = await this.raceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Race with ID ${id} not found`, { resource: "race", raceId: id });
    }
    existing.update({ ...data });
    try {
      const updatedEntity = await this.raceRepository.update(id, existing);
      return RaceMapper.toResponse(updatedEntity);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to update race",
        { operation: "updateRace", raceId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.raceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Race with ID ${id} not found`, { resource: "race", raceId: id });
    }
    try {
      await this.raceRepository.delete(id);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to delete race",
        { operation: "deleteRace", raceId: id },
        error,
      );
    }
  }

  async calculatePoints(position: number): Promise<number> {
    throw new NotImplemented("Race points calculation is not implemented", { position });
  }
}
