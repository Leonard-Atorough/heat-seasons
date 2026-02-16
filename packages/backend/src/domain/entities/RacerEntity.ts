import { EntityRoot } from "./EntityRoot";

export class RacerEntity extends EntityRoot {
  private constructor(
    id: string | undefined,
    public name: string,
    public active: boolean,
    public team: string,
    public teamColor: string,
    public nationality: string,
    public age: number,
    public joinDate: Date | undefined,
    public userId?: string,
    public badgeUrl?: string,
    public profileUrl?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Factory method for creating NEW entities (no ID yet)
   * Used by service layer when creating racers from DTOs
   */
  static create(data: {
    name: string;
    active: boolean;
    team: string;
    teamColor: string;
    nationality: string;
    age: number;
    userId?: string;
    badgeUrl?: string;
    profileUrl?: string;
  }): RacerEntity {
    return new RacerEntity(
      undefined, // No ID yet - will be assigned by repository
      data.name,
      data.active,
      data.team,
      data.teamColor,
      data.nationality,
      data.age,
      new Date(), // joinDate set to now for new racers
      data.userId,
      data.badgeUrl,
      data.profileUrl,
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
    name: string;
    active: boolean;
    team: string;
    teamColor: string;
    nationality: string;
    age: number;
    joinDate?: Date;
    userId?: string;
    badgeUrl?: string;
    profileUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): RacerEntity {
    return new RacerEntity(
      data.id,
      data.name,
      data.active,
      data.team,
      data.teamColor,
      data.nationality,
      data.age,
      data.joinDate,
      data.userId,
      data.badgeUrl,
      data.profileUrl,
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
      name: string;
      active: boolean;
      team: string;
      teamColor: string;
      nationality: string;
      age: number;
      userId?: string;
      badgeUrl?: string;
      profileUrl?: string;
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.active !== undefined) this.active = data.active;
    if (data.team !== undefined) this.team = data.team;
    if (data.teamColor !== undefined) this.teamColor = data.teamColor;
    if (data.nationality !== undefined) this.nationality = data.nationality;
    if (data.age !== undefined) this.age = data.age;
    if (data.userId !== undefined) this.userId = data.userId;
    if (data.badgeUrl !== undefined) this.badgeUrl = data.badgeUrl;
    if (data.profileUrl !== undefined) this.profileUrl = data.profileUrl;
  }

  assignToUser(userId: string) {
    if (this.userId && this.userId !== userId) {
      throw new Error("Racer is already assigned to another user");
    }
    this.userId = userId;
  }

  getUserId(): string {
    if (!this.userId) {
      throw new Error("Racer is not assigned to any user");
    }
    return this.userId;
  }
}
