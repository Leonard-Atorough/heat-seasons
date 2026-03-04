import { BootstrapEntity } from "src/domain/entities";

export class BootstrapMapper {
  static toDomain(data: any): BootstrapEntity {
    return BootstrapEntity.create({
      bootstrapTokenHash: data.bootstrapTokenHash,
      bootstrapTokenExpiresAt: new Date(data.bootstrapTokenExpiresAt),
      isInitialized: data.isInitialized,
    });
  }

  static toDomainFromPersistence(data: any): BootstrapEntity {
    return BootstrapEntity.reconstitute({
      id: data.id,
      bootstrapTokenHash: data.bootstrapTokenHash,
      bootstrapTokenExpiresAt: new Date(data.bootstrapTokenExpiresAt),
      isInitialized: data.isInitialized,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

  static toPersistence(entity: BootstrapEntity): any {
    return {
      id: entity.id,
      bootstrapTokenHash: entity.bootstrapTokenHash,
      bootstrapTokenExpiresAt: entity.bootstrapTokenExpiresAt,
      isInitialized: entity.isInitialized,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
