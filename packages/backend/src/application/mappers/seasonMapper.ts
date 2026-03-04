import { SeasonEntity } from "@src/domain/entities/seasonEntity";
import { SeasonCreateInput } from "src/application/dtos";
import { Season } from "shared";

export class SeasonMapper {
  static toDomain(dto: SeasonCreateInput): SeasonEntity {
    return SeasonEntity.create({
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
  }

  static toDomainFromPersistence(data: any): SeasonEntity {
    return SeasonEntity.reconstitute({
      id: data.id,
      name: data.name,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
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
    };
  }

  static toPersistence(entity: SeasonEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
