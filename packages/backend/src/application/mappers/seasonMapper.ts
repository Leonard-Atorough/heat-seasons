import { SeasonEntity } from "@src/domain/entities/SeasonEntity";
import { SeasonCreateInput } from "@src/models";
import { Season } from "shared";

export class SeasonMapper {
  static toDomain(dto: SeasonCreateInput): SeasonEntity {
    return SeasonEntity.create({
      name: dto.name,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalRaces: dto.totalRaces,
      racesCompleted: dto.racesCompleted,
      totalParticipants: dto.totalParticipants,
    });
  }

  static toDomainFromPersistence(data: any): SeasonEntity {
    return SeasonEntity.reconstitute({
      id: data.id,
      name: data.name,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      totalRaces: data.totalRaces,
      racesCompleted: data.racesCompleted,
      totalParticipants: data.totalParticipants,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  static toResponse(entity: SeasonEntity): Season {
    if (!entity.id) {
      throw new Error("Cannot convert unsaved entity to response");
    }
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalRaces: entity.totalRaces,
      racesCompleted: entity.racesCompleted,
      totalParticipants: entity.totalParticipants,
    };
  }

  static toPersistence(entity: SeasonEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalRaces: entity.totalRaces,
      racesCompleted: entity.racesCompleted,
      totalParticipants: entity.totalParticipants,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
