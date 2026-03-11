import { RaceEntity } from "../../domain/entities/index.js";
import { RaceCreateInput, RaceResponse } from "../../application/dtos/index.js";

export class RaceMapper {
  static toDomain(dto: RaceCreateInput): RaceEntity {
    return RaceEntity.create({
      seasonId: dto.seasonId,
       raceNumber: dto.raceNumber,
      name: dto.name,
      date: dto.date,
      results: dto.results,
    });
  }

  static toDomainFromPersistence(data: any): RaceEntity {
    return RaceEntity.reconstitute({
      id: data.id,
      seasonId: data.seasonId,
      raceNumber: data.raceNumber,
      name: data.name,
      date: data.date,
      completed: data.completed ?? false,
      results: data.results,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

  static toResponse(entity: RaceEntity): RaceResponse {
    if (!entity.id) {
      throw new Error("Cannot convert unsaved entity to response");
    }
    return {
      id: entity.id,
      seasonId: entity.seasonId,
      raceNumber: entity.raceNumber,
      name: entity.name,
      date: entity.date,
      completed: entity.completed,
      results: entity.results,
    } as RaceResponse;
  }

  static toPersistence(entity: RaceEntity): any {
    return {
      id: entity.id,
      seasonId: entity.seasonId,
      raceNumber: entity.raceNumber,
      name: entity.name,
      date: entity.date,
      completed: entity.completed,
      results: entity.results,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
