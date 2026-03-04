import { SeasonStatus } from "shared";
import { EntityRoot } from "./entityRoot";

export class SeasonEntity extends EntityRoot {
  private constructor(
    id: string | undefined,
    public name: string,
    public status: SeasonStatus,
    public startDate: Date,
    public endDate: Date | undefined,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(data: {
    name: string;
    startDate: Date;
    endDate?: Date;
  }): SeasonEntity {
    return new SeasonEntity(
      undefined,
      data.name,
      "upcoming" as SeasonStatus,
      data.startDate,
      data.endDate,
      undefined,
      undefined,
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    status: SeasonStatus;
    startDate: Date;
    endDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): SeasonEntity {
    return new SeasonEntity(
      data.id,
      data.name,
      data.status,
      data.startDate,
      data.endDate,
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
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.status !== undefined) this.status = data.status;
    if (data.startDate !== undefined) this.startDate = data.startDate;
    if (data.endDate !== undefined) this.endDate = data.endDate;
  }
}

