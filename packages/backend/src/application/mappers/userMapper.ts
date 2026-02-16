import { UserRole } from "shared";
import { UserEntity } from "src/domain/entities/UserEntity";
import { UserCreateInput, UserResponse, UserUpdateInput } from "src/models/user.model";

export class UserMapper {
  /**
   * Maps DTO to NEW domain entity (for creation)
   * Service layer uses this when creating users
   */
  static toDomain(dto: UserCreateInput): UserEntity {
    return UserEntity.create({
      googleId: dto.googleId,
      email: dto.email,
      name: dto.name,
      role: dto.role,
      profilePicture: dto.profilePicture,
      racerId: dto.racerId,
    });
  }

  /**
   * Maps persistence data to EXISTING domain entity (reconstitution)
   * Repository uses this when loading entities from storage
   */
  static toDomainFromPersistence(data: any): UserEntity {
    return UserEntity.reconstitute({
      id: data.id,
      googleId: data.googleId,
      email: data.email,
      name: data.name,
      role: data.role,
      profilePicture: data.profilePicture,
      racerId: data.racerId,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Maps domain entity to response DTO
   * API layer uses this to return data to clients
   */
  static toResponse(entity: UserEntity): UserResponse {
    if (!entity.id) {
      throw new Error("Cannot convert unsaved entity to response");
    }
    return {
      id: entity.id,
      racerId: entity.racerId,
      email: entity.email,
      name: entity.name,
      profilePicture: entity.profilePicture,
      role: entity.role as UserRole,
    };
  }

  /**
   * Maps domain entity to persistence format
   * Repository uses this when saving entities
   */
  static toPersistence(entity: UserEntity): any {
    return {
      id: entity.id,
      googleId: entity.googleId,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      profilePicture: entity.profilePicture,
      racerId: entity.racerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
