import { EntityRoot } from "./EntityRoot";

export class UserEntity extends EntityRoot {
  private constructor(
    id: string | undefined,
    public googleId: string,
    public email: string,
    public name: string,
    public role: string,
    public profilePicture?: string,
    public racerId?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Factory method for creating NEW entities (no ID yet)
   * Used by service layer when creating users from DTOs
   */
  static create(data: {
    googleId: string;
    email: string;
    name: string;
    role?: string;
    profilePicture?: string;
    racerId?: string;
  }): UserEntity {
    return new UserEntity(
      undefined, // No ID yet - will be assigned by repository
      data.googleId,
      data.email,
      data.name,
      data.role || "user",
      data.profilePicture,
      data.racerId,
      undefined, // No createdAt yet
      undefined, // No updatedAt yet
    );
  }

  /**
   * Factory method for reconstituting EXISTING entities from persistence
   * Used by repository when loading entities from storage
   */
  static reconstitute(data: {
    id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    profilePicture?: string;
    racerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    return new UserEntity(
      data.id,
      data.googleId,
      data.email,
      data.name,
      data.role,
      data.profilePicture,
      data.racerId,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Updates mutable properties of the entity
   * NOTE: Timestamps are handled by repository layer
   */
  update(
    data: Partial<{
      googleId: string;
      email: string;
      name: string;
      role: string;
      profilePicture?: string;
      racerId?: string;
    }>,
  ): void {
    if (data.googleId !== undefined) this.googleId = data.googleId;
    if (data.email !== undefined) this.email = data.email;
    if (data.name !== undefined) this.name = data.name;
    if (data.role !== undefined) this.role = data.role;
    if (data.profilePicture !== undefined) this.profilePicture = data.profilePicture;
    if (data.racerId !== undefined) this.racerId = data.racerId;
  }
}
