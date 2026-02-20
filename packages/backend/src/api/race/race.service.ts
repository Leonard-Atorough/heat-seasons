import { IRaceRepository } from "src/domain/repositories/race.repository.interface";
import { IRaceService } from "./race.service.interface.js";
import { RaceCreateInput, RaceResponse, RaceUpdateInput } from "src/models/race.model.js";
import { ISeasonRepository } from "src/domain/repositories/season.repository.interface";
import { RaceMapper } from "src/application/mappers/raceMapper.js";
import { NotFoundError } from "src/Infrastructure/errors/appError.js";
import { RaceEntity } from "src/domain/entities/RaceEntity.js";

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
      throw new NotFoundError(`Race with ID ${id} not found`);
    }
    return RaceMapper.toResponse(raceData as RaceEntity);
  }

  async create(seasonId: string, data: RaceCreateInput): Promise<RaceResponse> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundError("Season not found");
    }
    const raceToCreate = RaceMapper.toDomain({ ...data, seasonId });

    const createdRaceEntity = await this.raceRepository.create(raceToCreate);
    return RaceMapper.toResponse(createdRaceEntity);
  }

  async update(id: string, data: RaceUpdateInput): Promise<RaceResponse> {
    const existing = await this.raceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Race with ID ${id} not found`);
    }
    existing.update({ ...data });
    const updatedEntity = await this.raceRepository.update(id, existing);
    return RaceMapper.toResponse(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.raceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Race with ID ${id} not found`);
    }
    await this.raceRepository.delete(id);
  }

  async calculatePoints(position: number): Promise<number> {
    throw new Error("Not implemented");
  }
}
