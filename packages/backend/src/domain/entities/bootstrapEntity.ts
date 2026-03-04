import { EntityRoot } from "./entityRoot";

/**
 * Represents the bootstrap configuration for the application, including the bootstrap token and its expiration.
 * This entity is used to manage the initial setup of the application, ensuring that only authorized users can perform the bootstrap process.
 *
 * The bootstrap token is stored as a hash for security reasons, and the entity includes a flag to indicate whether the application has been initialized.
 */
export class BootstrapEntity extends EntityRoot {
  private constructor(
    public id: string | undefined,
    public bootstrapTokenHash: string,
    public bootstrapTokenExpiresAt: Date,
    public isInitialized: boolean,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(data: {
    bootstrapTokenHash: string;
    bootstrapTokenExpiresAt: Date;
    isInitialized: boolean;
  }): BootstrapEntity {
    return new BootstrapEntity(
      undefined,
      data.bootstrapTokenHash,
      data.bootstrapTokenExpiresAt,
      data.isInitialized,
      undefined,
      undefined,
    );
  }

  static reconstitute(data: {
    id: string;
    bootstrapTokenHash: string;
    bootstrapTokenExpiresAt: Date;
    isInitialized: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): BootstrapEntity {
    return new BootstrapEntity(
      data.id,
      data.bootstrapTokenHash,
      data.bootstrapTokenExpiresAt,
      data.isInitialized,
      data.createdAt,
      data.updatedAt,
    );
  }
}
