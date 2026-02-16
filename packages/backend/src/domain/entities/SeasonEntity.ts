import { Season, SeasonStatus } from "shared";
import { EntityRoot } from "./EntityRoot";

export class SeasonEntity extends EntityRoot {
  private constructor(
    id: string | undefined,
    public name: string,
    public status: SeasonStatus,
    public startDate: Date,
    public endDate: Date | undefined,
    public totalRaces: number,
    public racesCompleted: number,
    public totalParticipants: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(data: {
    name: string;
    status: SeasonStatus;
    startDate: Date;
    endDate?: Date;
    totalRaces: number;
    racesCompleted: number;
    totalParticipants: number;
  }): SeasonEntity {
    return new SeasonEntity(
      undefined, // No ID yet - will be assigned by repository
      data.name,
      data.status,
      data.startDate,
      data.endDate,
      data.totalRaces,
      data.racesCompleted,
      data.totalParticipants,
      undefined, // No createdAt yet
      undefined, // No updatedAt yet
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    status: SeasonStatus;
    startDate: Date;
    endDate?: Date;
    totalRaces: number;
    racesCompleted: number;
    totalParticipants: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): SeasonEntity {
    return new SeasonEntity(
      data.id,
      data.name,
      data.status,
      data.startDate,
      data.endDate,
      data.totalRaces,
      data.racesCompleted,
      data.totalParticipants,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(
    data: Partial<{
      name: string;
      status: SeasonStatus;
      startDate: Date;
      endDate: Date;
      totalRaces: number;
      racesCompleted: number;
      totalParticipants: number;
    }>,
  ): void {
    // TODO: Add validation logic here if needed (e.g., ensure status is valid, dates are consistent, etc.)
    if (data.name !== undefined) this.name = data.name;
    if (data.status !== undefined) this.status = data.status;
    if (data.startDate !== undefined) this.startDate = data.startDate;
    if (data.endDate !== undefined) this.endDate = data.endDate;
    if (data.totalRaces !== undefined) this.totalRaces = data.totalRaces;
    if (data.racesCompleted !== undefined) this.racesCompleted = data.racesCompleted;
    if (data.totalParticipants !== undefined) this.totalParticipants = data.totalParticipants;
  }
}
