import { Racer } from "shared";
import { RacerEntity } from "../../../src/domain/entities/RacerEntity";
import { RacerCreateInput, RacerUpdateInput } from "@src/models";

export class RacerMapper {
  /**
   * Maps DTO to NEW domain entity (for creation)
   * Service layer uses this when creating racers
   */
  static toDomain(dto: RacerCreateInput): RacerEntity {
    return RacerEntity.create({
      name: dto.name,
      active: dto.active ?? true,
      team: dto.team,
      teamColor: dto.teamColor,
      nationality: dto.nationality,
      age: dto.age,
      userId: dto.userId,
      badgeUrl: dto.badgeUrl,
      profileUrl: dto.profileUrl,
    });
  }

  /**
   * Maps persistence data to EXISTING domain entity (reconstitution)
   * Repository uses this when loading entities from storage
   */
  static toDomainFromPersistence(data: any): RacerEntity {
    return RacerEntity.reconstitute({
      id: data.id,
      name: data.name,
      active: data.active,
      team: data.team,
      teamColor: data.teamColor,
      nationality: data.nationality,
      age: data.age,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      userId: data.userId,
      badgeUrl: data.badgeUrl,
      profileUrl: data.profileUrl,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Maps domain entity to response DTO
   * API layer uses this to return data to clients
   */
  static toResponse(entity: RacerEntity): Racer {
    if (!entity.id) {
      throw new Error("Cannot convert unsaved entity to response");
    }
    return {
      id: entity.id,
      name: entity.name,
      active: entity.active,
      joinDate: entity.joinDate,
      team: entity.team,
      teamColor: entity.teamColor,
      nationality: entity.nationality,
      age: entity.age,
      badgeUrl: entity.badgeUrl,
      profileUrl: entity.profileUrl,
      userId: entity.userId,
    } as Racer;
  }

  /**
   * Maps domain entity to persistence format
   * Repository uses this when saving entities
   */
  static toPersistence(entity: RacerEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      active: entity.active,
      team: entity.team,
      teamColor: entity.teamColor,
      nationality: entity.nationality,
      age: entity.age,
      joinDate: entity.joinDate,
      userId: entity.userId,
      badgeUrl: entity.badgeUrl,
      profileUrl: entity.profileUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
